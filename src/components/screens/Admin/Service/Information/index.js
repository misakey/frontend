import React, { useEffect, useState, lazy, useCallback /* useMemo */ } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
// import prop from '@misakey/helpers/prop';

import routes from 'routes';
import API from '@misakey/api';
import { updateEntities } from '@misakey/store/actions/entities';
import ServiceSchema from 'store/schemas/Service';


// LAZY
const InformationHome = lazy(() => import('components/screens/Admin/Service/Information/Home'));
const InformationName = lazy(() => import('components/screens/Admin/Service/Information/Name'));
const InformationLogo = lazy(() => import('components/screens/Admin/Service/Information/Logo'));
const InformationShortDesc = lazy(() => import('components/screens/Admin/Service/Information/ShortDesc'));
const InformationLongDesc = lazy(() => import('components/screens/Admin/Service/Information/LongDesc'));

// CONSTANTS
// @FIXME js-common
const DOMAINS_ENDPOINT = {
  method: 'GET',
  path: '/domains',
  auth: true,
};

// HELPERS
const fetchApplicationDomains = (applicationId) => API
  .use(DOMAINS_ENDPOINT)
  .build(null, null, objectToSnakeCase({ applicationId }))
  .send();

// COMPONENTS
const ServiceInformation = ({ service, dispatchUpdate, ...rest }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [/* error */, setError] = useState();

  const fetchData = useCallback(() => {
    if (!isFetching) {
      setIsFetching(true);
      const { id, mainDomain } = service;

      fetchApplicationDomains(id)
        .then((response) => { dispatchUpdate(mainDomain, response.map(objectToCamelCase)); })
        .catch(setError)
        .finally(() => { setIsFetching(false); });
    }
  }, [service, isFetching, dispatchUpdate]);

  useEffect(fetchData, [service]);

  // TODO rework error status
  // const handledError = useMemo(() => prop('status')(error) || null, [error]);

  return (
  // <ResponseHandlerWrapper
  //   error={handledError}
  //   entity={service}
  //   isFetching={isFetching}
  // >
    <Switch>
      <Route
        exact
        path={routes.admin.service.information._}
        render={(routerProps) => (
          <InformationHome service={service} {...routerProps} {...rest} />
        )}
      />
      <Route
        exact
        path={routes.admin.service.information.name}
        render={(routerProps) => (
          <InformationName service={service} {...routerProps} {...rest} />
        )}
      />
      <Route
        path={routes.admin.service.information.logo._}
        render={(routerProps) => (
          <InformationLogo service={service} {...routerProps} {...rest} />
        )}
      />
      <Route
        exact
        path={routes.admin.service.information.shortDesc}
        render={(routerProps) => (
          <InformationShortDesc service={service} {...routerProps} {...rest} />
        )}
      />
      <Route
        exact
        path={routes.admin.service.information.longDesc}
        render={(routerProps) => (
          <InformationLongDesc service={service} {...routerProps} {...rest} />
        )}
      />
    </Switch>
  // </ResponseHandlerWrapper>
  );
};

ServiceInformation.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  dispatchUpdate: PropTypes.func.isRequired,
};

ServiceInformation.defaultProps = {
  service: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (id, changes) => {
    const entities = [{ id, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
  },
});

export default connect(null, mapDispatchToProps)(ServiceInformation);
