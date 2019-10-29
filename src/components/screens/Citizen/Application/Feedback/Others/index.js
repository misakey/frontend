import React, { useState, useMemo, useCallback } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { updateEntities } from '@misakey/store/actions/entities';

import ApplicationSchema from 'store/schemas/Application';

import useAsync from '@misakey/hooks/useAsync';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import propOr from '@misakey/helpers/propOr';
import isArray from '@misakey/helpers/isArray';
import isObject from '@misakey/helpers/isObject';
import API from '@misakey/api';

import { makeStyles } from '@material-ui/core/styles';
import Navigation from '@misakey/ui/Navigation';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import SummaryFeedbackCard from 'components/dumb/Card/Feedback/Summary';
import UserFeedbackCard from 'components/dumb/Card/Feedback/User';
import ScreenError from 'components/dumb/Screen/Error';
import List from '@material-ui/core/List';

// @FIXME use virtualized list!
// import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
// import VirtualizedList from 'react-virtualized/dist/commonjs/List';
// import CellMeasurer from 'react-virtualized/dist/commonjs/CellMeasurer';
// import CellMeasurerCache from 'react-virtualized/dist/commonjs/CellMeasurer/CellMeasurerCache';

import './index.scss';

// CONSTANTS
const EMPTY_RATINGS = [];
// const MIN_HEIGHT = 120;
// const CELL_MEASURER_CACHE_CONFIG = {
//   fixedWidth: true,
//   minHeight: MIN_HEIGHT,
// };

// @FIXME add endpoint to js-common
const RATINGS_ENDPOINT = {
  method: 'GET',
  path: '/ratings',
};

const AUTH_RATINGS_ENDPOINT = {
  ...RATINGS_ENDPOINT,
  auth: true,
};

// HELPERS
const getRatings = propOr(EMPTY_RATINGS, 'ratings');
const sortRatings = (aRating, bRating) => {
  if (moment(aRating.createdAt).isSameOrAfter(bRating.createdAt)) {
    return -1;
  }
  return 1;
};
const isPair = (pair) => !isNil(pair) && isArray(pair) && pair.length === 2;
const isEven = (index) => index % 2 === 0;

const mapRating = (rating) => {
  const { user } = rating;
  if (isObject(user)) {
    return { ...objectToCamelCase(rating), user: objectToCamelCase(user) };
  }
  return objectToCamelCase(rating);
};

const pairRatings = (ratings) => ratings.reduce((pairs, rating, index, list) => {
  if (isEven(index)) {
    pairs.push([rating, list[index + 1]]);
  }
  return pairs;
}, []);


const makeFetchFeedback = (isAuthenticated) => (applicationId, withUsers) => API
  .use(isAuthenticated ? AUTH_RATINGS_ENDPOINT : RATINGS_ENDPOINT)
  .build(null, null, objectToSnakeCase({ applicationId, withUsers }))
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    // 100% - navigation gutter - navigation border - navigation height
    // height: `calc(100% - ${theme.spacing(3)}px - 1px - 3.5rem)`,
  },
  feedbackRow: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  feedbackCardRoot: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      width: `calc(50% - ${theme.spacing(2)}px);`,
      margin: theme.spacing(1, 1, 1, 1),
    },
    [theme.breakpoints.down('xs')]: {
      margin: theme.spacing(1),
    },
  },
  ratingList: {
    [theme.breakpoints.down('xs')]: {
      // 100% - summary(sm)
      height: 'calc(100% - 226px)',
    },
    [theme.breakpoints.up('sm')]: {
      // 100% - summary
      height: 'calc(100% - 200px)',
    },
  },
}));

const useShouldFetch = (application, isFetching) => useMemo(
  () => {
    if (isFetching) { return false; }
    return (!isNil(application) && isNil(application.ratings));
  },
  [application, isFetching],
);

const useGetFeedback = (
  application, isAuthenticated, shouldFetch, fetchFeedback, setFetching, setError, dispatchUpdate,
) => useCallback(
  () => {
    if (shouldFetch) {
      setFetching(true);
      const withUsers = isAuthenticated;
      return fetchFeedback(application.id, withUsers)
        .then((response) => {
          const ratings = response.map(mapRating);
          dispatchUpdate(application.mainDomain, ratings);
        })
        .catch(({ httpStatus }) => {
          setError(httpStatus);
        })
        .finally(() => {
          setFetching(false);
        });
    }
    return null;
  },
  [application, isAuthenticated, shouldFetch, fetchFeedback, setFetching, setError, dispatchUpdate],
);

// const useRowRenderer = (
//   isAuthenticated, pairedRatings, cellMeasurerCache, classes) => useCallback(
//   ({ index, key, parent, style }) => {
//     const pair = pairedRatings[index];

//     if (!isPair(pair)) {
//       return null;
//     }

//     const [first, second] = pair;

//     return (
//       <CellMeasurer
//         cache={cellMeasurerCache}
//         columnIndex={0}
//         key={key}
//         rowIndex={index}
//         parent={parent}
//       >
//         <Box style={style} className={classes.feedbackRow}>
//           <UserFeedbackCard
//             isAuthenticated={isAuthenticated}
//             rating={first}
//             className={classes.feedbackCardRoot}
//           />
//           {second
//             && (
//               <UserFeedbackCard
//                 isAuthenticated={isAuthenticated}
//                 rating={second}
//                 className={classes.feedbackCardRoot}
//               />
//             )}
//         </Box>
//       </CellMeasurer>
//     );
//   },
//   [isAuthenticated, pairedRatings, cellMeasurerCache, classes],
// );

// COMPONENTS
const OthersFeedbackScreen = ({ isAuthenticated, application, t, history, dispatchUpdate }) => {
  const classes = useStyles();

  const [isFetching, setFetching] = useState(false);
  const [error, setError] = useState();

  // const cellMeasurerCache = useMemo(
  //   () => new CellMeasurerCache(CELL_MEASURER_CACHE_CONFIG),
  //   [],
  // );

  const shouldFetch = useShouldFetch(application, isFetching);
  const fetchFeedback = useMemo(
    () => makeFetchFeedback(isAuthenticated),
    [isAuthenticated],
  );
  const getFeedback = useGetFeedback(
    application, isAuthenticated, shouldFetch, fetchFeedback, setFetching, setError, dispatchUpdate,
  );

  const ratings = useMemo(
    () => getRatings(application).sort(sortRatings),
    [application],
  );

  const pairedRatings = useMemo(
    () => pairRatings(ratings),
    [ratings],
  );

  // const rowRenderer = useRowRenderer(isAuthenticated, pairedRatings, cellMeasurerCache, classes);

  useAsync(getFeedback, application);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <div className="OthersFeedbackScreen">
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        position="sticky"
        title={t('screens:feedback.others.title')}
      />
      <Container maxWidth="md" className={classes.container}>
        <SummaryFeedbackCard
          application={application}
          hideLink
          hideTitle
        />
        <List className={classes.ratingList}>
          {pairedRatings.map((pair) => {
            if (!isPair(pair)) { return null; }
            const [first, second] = pair;
            return (
              <Box key={first.id} className={classes.feedbackRow}>
                <UserFeedbackCard
                  isAuthenticated={isAuthenticated}
                  rating={first}
                  className={classes.feedbackCardRoot}
                />
                {second
                  && (
                    <UserFeedbackCard
                      isAuthenticated={isAuthenticated}
                      rating={second}
                      className={classes.feedbackCardRoot}
                    />
                  )}
              </Box>
            );
          })}
          {/* <AutoSizer>
            {({ width, height }) => (
              <VirtualizedList
                tabIndex={null}
                deferredMeasurementCache={cellMeasurerCache}
                height={height}
                rowCount={pairedRatings.length}
                rowHeight={cellMeasurerCache.rowHeight}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer> */}

        </List>
      </Container>
    </div>
  );
};

OthersFeedbackScreen.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  isAuthenticated: PropTypes.bool,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  dispatchUpdate: PropTypes.func.isRequired,
};

OthersFeedbackScreen.defaultProps = {
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (mainDomain, ratings) => {
    const entities = [{ id: mainDomain, changes: { ratings } }];
    dispatch(updateEntities(entities, ApplicationSchema.entity));
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('screens')(OthersFeedbackScreen));
