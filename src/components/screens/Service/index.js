import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch } from 'react-router-dom';
import { normalize, denormalize } from 'normalizr';

import parseJwt from '@misakey/helpers/parseJwt';
import isEmpty from '@misakey/helpers/isEmpty';

import API from '@misakey/api';
import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';
import { screenServiceUpdate } from 'store/actions/screens/Service';
import { receiveEntities } from '@misakey/store/actions/entities';

import useAsync from '@misakey/hooks/useAsync';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import pick from '@misakey/helpers/pick';
import compose from '@misakey/helpers/compose';
import when from '@misakey/helpers/when';
import trim from '@misakey/helpers/trim';

import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import RouteService, { DEFAULT_DOMAIN, DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';
import Screen from 'components/dumb/Screen';

import Drawer from './Drawer';
import ServiceClaim from './Claim';
import ServiceRoleClaim from './Role/Claim';
import ServiceHome from './Home';
import ServiceInformation from './Information';
import ServiceSSO from './SSO';
import ServiceUsers from './Users';
import ServiceData from './Data';
import ServiceRequests from './Requests';

import './Service.scss';

// CONSTANTS
export const SERVICE_SCREEN_NAMES = {
  CLAIM: 'ServiceClaim',
  INFORMATION: 'ServiceInformation',
  SSO: 'ServiceSSO',
  USERS: 'ServiceUsers',
  DATA: 'ServiceData',
  REQUESTS: 'ServiceRequests',
  HOME: 'ServiceHome',
};

const SERVICE_PROPS = ['id', 'mainDomain'];
// @FIXME js-common
const APPINFO_ENDPOINT = {
  method: 'GET',
  path: '/application-info',
};

// HELPERS
const getService = compose(
  pick(SERVICE_PROPS),
  prop('0'),
);

const isDefault = (mainDomain) => mainDomain === 'service';
const mainDomainMatch = compose(
  when(isDefault, () => null),
  trim,
  path(['params', 'mainDomain']),
);

const fetchApplication = (mainDomain) => API
  .use(APPINFO_ENDPOINT)
  .build(null, null, objectToSnakeCase({ mainDomain }))
  .send();

// HOOKS
const useShouldFetch = (isFetching, error, entity) => useMemo(
  () => !isFetching && isNil(error) && isNil(entity),
  [isFetching, error, entity],
);

const useGetApplication = (
  mainDomain, match, shouldFetch, dispatchReceive, setIsFetching, setError,
) => useCallback(() => {
  const param = isNil(mainDomain) ? mainDomainMatch(match) : mainDomain;
  if (shouldFetch && !isNil(param)) {
    setIsFetching(true);
    return fetchApplication(param)
      .then((responseBody) => {
        const data = responseBody.map(objectToCamelCase);
        dispatchReceive(data);
        setIsFetching(false);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus || 500;
        setError(httpStatus);
        setIsFetching(false);
      });
  }
  return null;
}, [mainDomain, match, shouldFetch, dispatchReceive, setIsFetching, setError]);

// COMPONENTS
function Service({ match, entity, dispatchReceive, userId }) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const mainDomain = useMemo(() => match.params.mainDomain, [match.params.mainDomain]);

  const shouldFetch = useShouldFetch(isFetching, error, entity);

  const getApplication = useGetApplication(
    mainDomain, match, shouldFetch, dispatchReceive, setIsFetching, setError,
  );

  const responseEntity = useMemo(
    () => (mainDomain === DEFAULT_DOMAIN ? DEFAULT_SERVICE_ENTITY : entity),
    [mainDomain, entity],
  );

  useAsync(getApplication, mainDomain);

  return (
    <Screen className="Service">
      <ResponseHandlerWrapper
        error={error}
        entity={responseEntity}
        isFetching={isFetching}
      >
        <Drawer mainDomain={mainDomain}>
          <Switch>
            <RouteService
              path={routes.service.claim._}
              component={ServiceClaim}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.CLAIM, userId }}
            />
            <RouteService
              path={routes.service.role.claim._}
              component={ServiceRoleClaim}
              componentProps={{ service: entity, name: 'ServiceRoleClaim', userId }}
            />
            <RouteService
              path={routes.service.information._}
              component={ServiceInformation}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.INFORMATION }}
            />
            <RouteService
              path={routes.service.sso._}
              component={ServiceSSO}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.SSO }}
            />
            <RouteService
              path={routes.service.users._}
              component={ServiceUsers}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.USERS }}
            />
            <RouteService
              path={routes.service.data._}
              component={ServiceData}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.DATA }}
            />
            <RouteService
              path={routes.service.requests._}
              component={ServiceRequests}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.REQUESTS }}
            />
            <RouteService
              exact
              path={match.path}
              component={ServiceHome}
              componentProps={{ service: entity, name: SERVICE_SCREEN_NAMES.HOME }}
            />
          </Switch>
        </Drawer>
      </ResponseHandlerWrapper>
    </Screen>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ServiceSchema.propTypes),
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({ mainDomain: PropTypes.string }),
  }).isRequired,
  dispatchReceive: PropTypes.func.isRequired,
  userId: PropTypes.string,
};

Service.defaultProps = {
  entity: null,
  userId: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  ...state.screens.Service,
  entity: denormalize(
    state.screens.Service.mainDomain,
    ServiceSchema.entity,
    state.entities,
  ),
  userId: !isEmpty(state.auth.id) ? parseJwt(state.auth.id).sub : null,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (data) => {
    const normalized = normalize(data, ServiceSchema.collection);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
    const service = getService(data);
    dispatch(screenServiceUpdate(service));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Service);
