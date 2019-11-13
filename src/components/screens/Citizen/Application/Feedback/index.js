import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';
import { Switch, Route } from 'react-router-dom';

import API from '@misakey/api';
import routes from 'routes';

import { receiveEntities } from '@misakey/store/actions/entities';
import ApplicationSchema from 'store/schemas/Application';

import useAsync from '@misakey/hooks/useAsync';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';

import PrivateRoute from '@misakey/auth/components/Route/Private';
import SplashScreen from 'components/dumb/SplashScreen';
import ScreenError from 'components/dumb/Screen/Error';

import './index.scss';

// LAZY
const FeedbackOthers = lazy(() => import('components/screens/Citizen/Application/Feedback/Others'));
const FeedbackMe = lazy(() => import('components/screens/Citizen/Application/Feedback/Me'));


// HELPERS
const fetchApplication = (mainDomain, isAuthenticated) => {
  const endpoint = API.endpoints.application.read;
  if (!isAuthenticated) { endpoint.auth = false; }
  return API
    .use(endpoint)
    .build({ mainDomain })
    .send();
};

// HOOKS
const useShouldFetch = (isFetching, error, entity) => useMemo(
  () => !isFetching && isNil(error) && isNil(entity),
  [isFetching, error, entity],
);

const useGetApplication = (
  mainDomain, isAuthenticated, shouldFetch, setFetching, setError, dispatchReceive,
) => useCallback(
  () => {
    if (shouldFetch && !isNil(mainDomain)) {
      setFetching(true);
      return fetchApplication(mainDomain, isAuthenticated)
        .then((responseBody) => {
          dispatchReceive(objectToCamelCase(responseBody));
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
  [mainDomain, isAuthenticated, shouldFetch, setFetching, setError, dispatchReceive],
);

// COMPONENTS
const FeedbackScreen = ({ application, isAuthenticated, match: { params }, dispatchReceive }) => {
  const [error, setError] = useState();
  const [isFetching, setFetching] = useState(false);

  const { mainDomain } = params;

  const shouldFetch = useShouldFetch(isFetching, error, application);
  const getApplication = useGetApplication(
    mainDomain,
    isAuthenticated,
    shouldFetch,
    setFetching,
    setError,
    dispatchReceive,
  );

  useAsync(getApplication, mainDomain);

  if (isFetching) {
    return <SplashScreen />;
  }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  if (isNil(application)) {
    return null;
  }

  return (
    <div className="FeedbackScreen">
      <Suspense fallback={<SplashScreen />}>
        <Switch>
          <Route
            path={routes.citizen.application.feedback.others}
            exact
            render={(routerProps) => (
              <FeedbackOthers application={application} {...routerProps} />
            )}
          />
          <PrivateRoute
            path={routes.citizen.application.feedback.me}
            exact
            component={(routerProps) => (
              <FeedbackMe application={application} {...routerProps} />
            )}
          />
        </Switch>
      </Suspense>
    </div>
  );
};

FeedbackScreen.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  isAuthenticated: PropTypes.bool,
  dispatchReceive: PropTypes.func.isRequired,
};

FeedbackScreen.defaultProps = {
  application: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state, ownProps) => ({
  application: denormalize(
    ownProps.match.params.mainDomain,
    ApplicationSchema.entity,
    state.entities,
  ),
  isAuthenticated: !!state.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (data) => {
    const normalized = normalize(data, ApplicationSchema.entity);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackScreen);
