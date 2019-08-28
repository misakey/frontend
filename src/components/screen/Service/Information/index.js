import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { denormalize } from 'normalizr';
import { connect } from 'react-redux';

import routes from 'routes';
import API from '@misakey/api';

import { updateEntities } from '@misakey/store/actions/entities';

import ServiceSchema from 'store/schemas/Service';

import useAsync from '@misakey/hooks/useAsync';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';
import prop from '@misakey/helpers/prop';

import ScreenError from 'components/screen/Error';
import SplashScreen from '@misakey/ui/SplashScreen';

// LAZY
const InformationHome = lazy(() => import('./Home'));
const InformationName = lazy(() => import('./Name'));
const InformationLogo = lazy(() => import('./Logo'));
const InformationShortDesc = lazy(() => import('./ShortDesc'));
const InformationLongDesc = lazy(() => import('./LongDesc'));

// CONSTANTS
// @FIXME js-common
const DOMAINS_ENDPOINT = {
  method: 'GET',
  path: '/domains',
  auth: true,
};

// HELPERS
const getMainDomain = prop('mainDomain');

const fetchApplicationDomains = applicationId => API
  .use(DOMAINS_ENDPOINT)
  .build(null, null, objectToSnakeCase({ applicationId }))
  .send();

// HOOKS
const useShouldFetch = (isFetching, error, entity) => useMemo(
  () => !isFetching && isNil(error)
    && (isNil(entity) || (isObject(entity) && isNil(entity.domains))),
  [isFetching, error, entity],
);

const useGetApplicationInfo = (
  service, shouldFetch, dispatchUpdate, setIsFetching, setError,
) => useCallback(() => {
  if (shouldFetch && !isNil(service)) {
    const { id, mainDomain } = service;
    setIsFetching(true);
    return fetchApplicationDomains(id)
      .then((response) => {
        const domains = response.body.map(objectToCamelCase);
        dispatchUpdate(mainDomain, { domains });
        setIsFetching(false);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus ? error.httpStatus : 500;
        setError(httpStatus);
        setIsFetching(false);
      });
  }
  return null;
}, [service, shouldFetch, dispatchUpdate, setIsFetching, setError]);

// COMPONENTS
const ServiceInformation = ({ service, entity, dispatchUpdate }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const shouldFetch = useShouldFetch(isFetching, error, entity);

  const getApplicationInfo = useGetApplicationInfo(
    service, shouldFetch, dispatchUpdate, setIsFetching, setError,
  );

  useAsync(getApplicationInfo, service);


  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <Switch>
        <Route
          exact
          path={routes.service.information._}
          render={routerProps => <InformationHome service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.information.name}
          render={routerProps => <InformationName service={entity} {...routerProps} />}
        />
        <Route
          path={routes.service.information.logo._}
          render={routerProps => <InformationLogo service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.information.shortDesc}
          render={routerProps => <InformationShortDesc service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.information.longDesc}
          render={routerProps => <InformationLongDesc service={entity} {...routerProps} />}
        />
      </Switch>
    </Suspense>
  );
};

ServiceInformation.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  // CONNECT
  // - state
  entity: PropTypes.shape(ServiceSchema.propTypes),

  // - dispatch
  dispatchUpdate: PropTypes.func.isRequired,
};

ServiceInformation.defaultProps = {
  service: null,
  entity: null,
};

// CONNECT
const mapStateToProps = (state, { service }) => {
  const mainDomain = getMainDomain(service);
  return {
    entity: denormalize(
      mainDomain,
      ServiceSchema.entity,
      state.entities,
    ),
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchUpdate: (id, changes) => {
    const entities = [{ id, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceInformation);
