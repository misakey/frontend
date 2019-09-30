import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';
import { Switch } from 'react-router-dom';

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

import RouteService from 'components/smart/Route/Service';
import Drawer from 'components/screen/Service/Drawer';
import Screen from 'components/screen';
import ScreenError from 'components/screen/Error';
import ServiceClaim from './Claim';
import ServiceHome from './Home';
import ServiceInformation from './Information';
import ServiceSSO from './SSO';
import ServiceUsers from './Users';
import ServiceData from './Data';
import ServiceRequests from './Requests';

import './Service.scss';

// CONSTANTS
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

const isDefault = mainDomain => mainDomain === 'service';
const mainDomainMatch = compose(
  when(isDefault, () => null),
  trim,
  path(['params', 'mainDomain']),
);

const fetchApplication = mainDomain => API
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
function Service({ match, mainDomain, entity, dispatchReceive, userId }) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const shouldFetch = useShouldFetch(isFetching, error, entity);

  const getApplication = useGetApplication(
    mainDomain, match, shouldFetch, dispatchReceive, setIsFetching, setError,
  );

  useAsync(getApplication, mainDomain);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Screen className="Service">
      <Drawer mainDomain={match.params.mainDomain}>
        <Switch>
          <RouteService
            path={routes.service.claim._}
            component={ServiceClaim}
            componentProps={{ service: entity, name: 'ServiceClaim', userId }}
          />
          <RouteService
            path={routes.service.information._}
            component={ServiceInformation}
            componentProps={{ service: entity, name: 'ServiceInformation' }}
          />
          <RouteService
            path={routes.service.sso._}
            component={ServiceSSO}
            componentProps={{ service: entity, name: 'ServiceSSO' }}
          />
          <RouteService
            path={routes.service.users._}
            component={ServiceUsers}
            componentProps={{ service: entity, name: 'ServiceUsers' }}
          />
          <RouteService
            path={routes.service.data._}
            component={ServiceData}
            componentProps={{ service: entity, name: 'ServiceData' }}
          />
          <RouteService
            path={routes.service.requests._}
            component={ServiceRequests}
            componentProps={{ service: entity, name: 'ServiceRequests' }}
          />
          <RouteService
            exact
            path={match.path}
            component={ServiceHome}
            componentProps={{ service: entity, name: 'ServiceHome' }}
          />
        </Switch>
      </Drawer>
    </Screen>
  );
}

Service.propTypes = {
  mainDomain: PropTypes.string,
  entity: PropTypes.shape(ServiceSchema.propTypes),
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({ mainDomain: PropTypes.string }),
  }).isRequired,
  dispatchReceive: PropTypes.func.isRequired,
  userId: PropTypes.string,
};

Service.defaultProps = {
  mainDomain: null,
  entity: null,
  userId: null,
};

// CONNECT
const mapStateToProps = state => ({
  ...state.screens.Service,
  entity: denormalize(
    state.screens.Service.mainDomain,
    ServiceSchema.entity,
    state.entities,
  ),
  userId: !isEmpty(state.auth.id) ? parseJwt(state.auth.id).sub : null,
});

const mapDispatchToProps = dispatch => ({
  dispatchReceive: (data) => {
    const normalized = normalize(data, ServiceSchema.collection);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
    const service = getService(data);
    dispatch(screenServiceUpdate(service));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Service);
