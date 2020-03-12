import React, { useMemo, useCallback } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import routes from 'routes';

import { updateEntities } from '@misakey/store/actions/entities';

import ApplicationSchema from 'store/schemas/Application';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import API from '@misakey/api';
import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import propOr from '@misakey/helpers/propOr';
import withMyFeedback from 'components/smart/withMyFeedback';
import LinkWithDialogConnect from 'components/smart/Dialog/Connect/with/Link';

import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import Title from 'components/dumb/Typography/Title';
import List from '@material-ui/core/List';
import SummaryFeedbackCard from 'components/dumb/Card/Feedback/Summary';
import SummaryFeedbackCardSkeleton from 'components/dumb/Card/Feedback/Summary/Skeleton';
import ScreenError from 'components/dumb/Screen/Error';
import UserFeedbackCard from 'components/dumb/Card/Feedback/User';
import UserFeedbackCardSkeleton from 'components/dumb/Card/Feedback/User/Skeleton';

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

const useShouldFetch = (application) => useMemo(
  () => (!isNil(application) && !isNil(application.id) && isNil(application.ratings)),
  [application],
);

// COMPONENTS
const ApplicationInfoFeedback = ({
  isAuthenticated, application, dispatchUpdate, t, rating, isFetchingFeedback,
}) => {
  const classes = useStyles();

  const shouldFetch = useShouldFetch(application);
  const fetchFeedback = useMemo(
    () => makeFetchFeedback(isAuthenticated),
    [isAuthenticated],
  );

  const feedbackTo = useMemo(
    () => generatePath(
      routes.citizen.application.myFeedback,
      { mainDomain: application.mainDomain },
    ),
    [application.mainDomain],
  );

  const getFeedback = useCallback(
    () => {
      const withUsers = isAuthenticated;
      return fetchFeedback(application.id, withUsers);
    },
    [isAuthenticated, application, fetchFeedback],
  );

  const onSuccess = useCallback(
    (response) => {
      const ratings = response.map(mapRating);
      dispatchUpdate(application.mainDomain, ratings);
    },
    [application.mainDomain, dispatchUpdate],
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

  // because we clear avgRating when changing user's feedback
  const summaryLoading = useMemo(
    () => isNil(application.avgRating),
    [application],
  );

  const { isFetching, error } = useFetchEffect(
    getFeedback,
    { shouldFetch },
    { onSuccess },
  );

  if (error) {
    return <ScreenError httpStatus={error.httpStatus} />;
  }

  return (
    <Box>
      <Box className={classes.titleWithAction}>
        <Title>
          {t('citizen:application.info.feedback.title')}
        </Title>
        <Button
          standing={BUTTON_STANDINGS.MAIN}
          text={t(`citizen:application.info.feedback.${(hasAlreadyCommented) ? 'edit' : 'give'}`)}
          component={LinkWithDialogConnect}
          isLoading={isFetchingFeedback}
          to={feedbackTo}
        />
      </Box>
      {summaryLoading ? (
        <SummaryFeedbackCardSkeleton
          hideTitle
        />
      ) : (
        <SummaryFeedbackCard
          application={application}
          hideLink
          hideTitle
        />
      )}
      <List>
        {isFetching && (
          <UserFeedbackCardSkeleton
            count={application.totalRating}
            className={classes.feedbackCardRoot}
          />
        )}
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

ApplicationInfoFeedback.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  isAuthenticated: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
  // ROUTER
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  // CONNECT
  dispatchUpdate: PropTypes.func.isRequired,
  // withMyFeedback
  rating: PropTypes.object,
  isFetchingFeedback: PropTypes.bool,
};

ApplicationInfoFeedback.defaultProps = {
  isAuthenticated: false,
  isFetchingFeedback: true,
  rating: null,
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
)(withTranslation('citizen')(withMyFeedback()(ApplicationInfoFeedback)));
