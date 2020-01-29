import React, { useState, useMemo, useCallback } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import routes from 'routes';

import { updateEntities } from '@misakey/store/actions/entities';

import ApplicationSchema from 'store/schemas/Application';

import useAsync from '@misakey/hooks/useAsync';

import API from '@misakey/api';
import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import propOr from '@misakey/helpers/propOr';
import withMyFeedback from 'components/smart/withMyFeedback';

import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import Title from 'components/dumb/Typography/Title';
import List from '@material-ui/core/List';
import SummaryFeedbackCard from 'components/dumb/Card/Feedback/Summary';
import ScreenError from 'components/dumb/Screen/Error';
import UserFeedbackCard from 'components/dumb/Card/Feedback/User';


// CONSTANTS
const EMPTY_RATINGS = [];


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
  feedbackRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  feedbackCardRoot: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
  },
  titleWithAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const useShouldFetch = (application, isFetching, isLoading) => useMemo(
  () => {
    if (isFetching || isLoading) { return false; }
    return (!isNil(application) && !isNil(application.id) && isNil(application.ratings));
  },
  [application, isFetching, isLoading],
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

// COMPONENTS
const OthersFeedbackScreen = ({
  isAuthenticated, application, dispatchUpdate, t, isLoading, rating, isFetchingRating,
}) => {
  const classes = useStyles();

  const [isFetching, setFetching] = useState(false);
  const [error, setError] = useState();

  const shouldFetch = useShouldFetch(application, isFetching, isLoading);
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

  const hasAlreadyCommented = useMemo(
    () => !isNil(rating),
    [rating],
  );

  useAsync(getFeedback, application);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Box>
      <Box className={classes.titleWithAction}>
        <Title>
          {t('screens:feedback.others.title')}
        </Title>
        {(!isFetchingRating) && (
          <Button
            standing={BUTTON_STANDINGS.MAIN}
            text={t(`screens:feedback.others.${(hasAlreadyCommented) ? 'edit' : 'give'}`)}
            component={Link}
            to={generatePath(
              routes.citizen.application.myFeedback,
              { mainDomain: application.mainDomain },
            )}
          />
        )}
      </Box>
      <SummaryFeedbackCard
        application={application}
        hideLink
        hideTitle
      />
      <List>
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
      </List>
    </Box>
  );
};

OthersFeedbackScreen.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  isAuthenticated: PropTypes.bool,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  dispatchUpdate: PropTypes.func.isRequired,
  isFetchingRating: PropTypes.bool,
  rating: PropTypes.object,
  isLoading: PropTypes.bool,
};

OthersFeedbackScreen.defaultProps = {
  isAuthenticated: false,
  isFetchingRating: true,
  rating: null,
  isLoading: false,
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


export default connect(
  mapStateToProps, mapDispatchToProps,
)(withTranslation('screens')(withMyFeedback()(OthersFeedbackScreen)));
