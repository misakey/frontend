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
import props from '@misakey/helpers/props';
import compose from '@misakey/helpers/compose';
import includes from '@misakey/helpers/includes';

import ScreenError from 'components/screen/Error';
import SplashScreen from '@misakey/ui/SplashScreen';

import './index.scss';

// LAZY
const SSOHome = lazy(() => import('./Home'));
const SSOAllowedOrigins = lazy(() => import('./AllowedOrigins'));
const SSORedirectUri = lazy(() => import('./RedirectUri'));
const SSOProductionSetup = lazy(() => import('./ProductionSetup'));
const SSOCustomRoles = lazy(() => import('./CustomRoles'));

// CONSTANTS
const SSO_PROPS = ['allowedCorsOrigins', 'redirectUris'];

const SSO_DEFAULT = {
  allowedCorsOrigins: [],
  redirectUris: [],
};

// @FIXME js-common
const SSO_ENDPOINT = {
  method: 'GET',
  path: '/sso-clients/:id',
  auth: true,
};

// HELPERS
const getMainDomain = prop('mainDomain');

const getSSOProps = props(SSO_PROPS);
const includesUndefined = list => includes(list, undefined);
const missingSSOProps = compose(
  includesUndefined,
  getSSOProps,
);

const fetchApplicationSSO = id => API
  .use(SSO_ENDPOINT)
  .build(objectToSnakeCase({ id }))
  .send();

// HOOKS
const useShouldFetch = (isFetching, error, entity) => useMemo(
  () => !isFetching && isNil(error)
    && (isNil(entity) || (isObject(entity) && missingSSOProps(entity))),
  [isFetching, error, entity],
);

const useGetApplicationSSO = (
  service, shouldFetch, dispatchUpdate, setIsFetching, setError,
) => useCallback(() => {
  if (shouldFetch && !isNil(service)) {
    const { id, mainDomain } = service;
    setIsFetching(true);
    return fetchApplicationSSO(id)
      .then((response) => {
        const sso = objectToCamelCase(response.body);
        dispatchUpdate(mainDomain, sso);
        setIsFetching(false);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus ? error.httpStatus : 500;
        if (httpStatus === 404) {
          dispatchUpdate(mainDomain, SSO_DEFAULT);
        } else {
          setError(httpStatus);
        }
        setIsFetching(false);
      });
  }
  return null;
}, [service, shouldFetch, dispatchUpdate, setIsFetching, setError]);

// COMPONENTS
const ServiceSSO = ({ service, entity, dispatchUpdate }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const shouldFetch = useShouldFetch(isFetching, error, entity);

  const getApplicationSSO = useGetApplicationSSO(
    service, shouldFetch, dispatchUpdate, setIsFetching, setError,
  );

  useAsync(getApplicationSSO, service);


  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <Switch>
        <Route
          exact
          path={routes.service.sso._}
          render={routerProps => <SSOHome service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.sso.allowedOrigins}
          render={routerProps => <SSOAllowedOrigins service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.sso.redirectUri}
          render={routerProps => <SSORedirectUri service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.sso.productionSetup}
          render={routerProps => <SSOProductionSetup service={entity} {...routerProps} />}
        />
        <Route
          exact
          path={routes.service.sso.customRoles}
          render={routerProps => <SSOCustomRoles service={entity} {...routerProps} />}
        />
      </Switch>
    </Suspense>
  );
};

ServiceSSO.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  // CONNECT
  // - state
  entity: PropTypes.shape(ServiceSchema.propTypes),

  // - dispatch
  dispatchUpdate: PropTypes.func.isRequired,
};

ServiceSSO.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ServiceSSO);
