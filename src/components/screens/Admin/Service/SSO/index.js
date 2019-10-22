import React, { useState, lazy, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import routes from 'routes';
import API from '@misakey/api';
import { updateEntities } from '@misakey/store/actions/entities';
import ServiceSchema from 'store/schemas/Service';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import prop from '@misakey/helpers/prop';
import props from '@misakey/helpers/props';
import compose from '@misakey/helpers/compose';
import includes from '@misakey/helpers/includes';

import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';

// LAZY
const SSOHome = lazy(() => import('components/screens/Admin/Service/SSO/Home'));
const SSOAllowedOrigins = lazy(() => import('components/screens/Admin/Service/SSO/AllowedOrigins'));
const SSORedirectUri = lazy(() => import('components/screens/Admin/Service/SSO/RedirectUri'));
const SSOProductionSetup = lazy(() => import('components/screens/Admin/Service/SSO/ProductionSetup'));
const SSOCustomRoles = lazy(() => import('components/screens/Admin/Service/SSO/CustomRoles'));

// CONSTANTS
const SSO_PROPS = ['allowedCorsOrigins', 'redirectUris'];

const SSO_DEFAULT = {
  allowedCorsOrigins: null,
  redirectUris: null,
};

const getSSOProps = props(SSO_PROPS);
const includesUndefined = (list) => includes(list, undefined);
const missingSSOProps = compose(
  includesUndefined,
  getSSOProps,
);

const fetchApplicationSSO = (id) => API
  .use(API.endpoints.sso.read)
  .build(objectToSnakeCase({ id }))
  .send();

// COMPONENTS
const ServiceSSO = ({ service, dispatchUpdate }) => {
  const [isFetching, setFetching] = useState(false);
  const [error, setError] = useState();

  const fetchData = useCallback(() => {
    if (!isFetching && missingSSOProps(service)) {
      setFetching(true);
      const { id, mainDomain } = service;

      fetchApplicationSSO(id)
        .then((response) => { dispatchUpdate(mainDomain, objectToCamelCase(response)); })
        .catch((e) => {
          if (e.status === 404) {
            dispatchUpdate(mainDomain, SSO_DEFAULT);
          } else { setError(e); }
        })
        .finally(() => { setFetching(false); });
    }
  }, [service, isFetching, dispatchUpdate]);

  useEffect(fetchData, [service]);

  // TODO rework error status ResponseHandlerWrapper
  const handledError = useMemo(() => prop('status')(error) || null, [error]);

  return (
    <ResponseHandlerWrapper
      error={handledError}
      entity={service}
      isFetching={isFetching}
    >
      <Switch>
        <Route
          exact
          path={routes.admin.service.sso._}
          render={(routerProps) => <SSOHome service={service} {...routerProps} />}
        />
        <Route
          exact
          path={routes.admin.service.sso.allowedOrigins}
          render={(routerProps) => <SSOAllowedOrigins service={service} {...routerProps} />}
        />
        <Route
          exact
          path={routes.admin.service.sso.redirectUri}
          render={(routerProps) => <SSORedirectUri service={service} {...routerProps} />}
        />
        <Route
          exact
          path={routes.admin.service.sso.productionSetup}
          render={(routerProps) => <SSOProductionSetup service={service} {...routerProps} />}
        />
        <Route
          exact
          path={routes.admin.service.sso.customRoles}
          render={(routerProps) => <SSOCustomRoles service={service} {...routerProps} />}
        />
      </Switch>
    </ResponseHandlerWrapper>
  );
};

ServiceSSO.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  dispatchUpdate: PropTypes.func.isRequired,
};

ServiceSSO.defaultProps = {
  service: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (id, changes) => {
    const entities = [{ id, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
  },
});

export default connect(null, mapDispatchToProps)(ServiceSSO);
