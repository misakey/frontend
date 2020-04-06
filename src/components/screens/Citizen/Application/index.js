import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';

import withApplication from 'components/smart/withApplication';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import ApplicationNotFound from 'components/screens/Citizen/Application/NotFound';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import MyFeedback from 'components/screens/Citizen/Application/MyFeedback';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';

import BoxEllipsisApplication from 'components/dumb/Box/Ellipsis/Application';

// CONSTANTS
const PAGES_ROSES_ENDPOINT = {
  method: 'GET',
  path: '/applications/:mainDomain',
};

// HELPERS
const matchMainDomain = (entity, mainDomain) => prop('mainDomain', entity) === mainDomain;

// COMPONENTS
function Application({ entity, error, isFetching, mainDomain }) {
  const application = useMemo(
    () => ((!matchMainDomain(entity, mainDomain) || isNil(entity))
      ? { mainDomain }
      : entity),
    [mainDomain, entity],
  );

  const state = useMemo(
    () => ({
      isLoading: isFetching && isEmpty(entity),
    }),
    [isFetching, entity],
  );


  const screenProps = useMemo(
    () => ({
      state,
    }),
    [state],
  );

  const items = useMemo(
    () => ([<BoxEllipsisApplication key="application" application={application} />]),
    [application],
  );

  const infoProps = useMemo(
    () => ({
      screenProps: {
        ...screenProps,
        appBarProps: { elevationScroll: false, items },
      },
      entity: application,
    }),
    [screenProps, application, items],
  );

  if (error && error.status === 404) {
    return <ApplicationNotFound mainDomain={mainDomain} />;
  }

  return (
    <Switch>
      <RoutePrivate
        path={routes.citizen.application.contact._}
        component={ApplicationContact}
        componentProps={{
          entity: application,
          error,
          isFetching,
          mainDomain,
          screenProps,
        }}
      />
      <RoutePrivate
        path={routes.citizen.application.myFeedback}
        component={MyFeedback}
        componentProps={{
          application,
          screenProps,
        }}
      />

      <Route
        path={routes.citizen.application._}
        render={(routerProps) => (
          <ApplicationInfo
            {...infoProps}
            {...routerProps}
          />
        )}
      />
    </Switch>
  );
}

Application.propTypes = {
  // withApplication
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.object,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
};

Application.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Application, {
  endpoint: PAGES_ROSES_ENDPOINT,
  paramMapper: (props) => [props],
  getSpecificShouldFetch: (entity) => {
    const { avgRating } = entity || {};
    return isNil(avgRating);
  },
});
