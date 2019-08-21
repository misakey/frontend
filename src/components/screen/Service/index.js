import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { Switch } from 'react-router-dom';

import parseJwt from '@misakey/helpers/parseJwt';
import isEmpty from '@misakey/helpers/isEmpty';

import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';

import RouteService from 'components/smart/Route/Service';
import Screen from 'components/screen';

import ServiceClaim from './Claim';
import ServiceHome from './Home';
import ServiceInformation from './Information';
import ServiceSSO from './SSO';
import ServiceUsers from './Users';
import ServiceData from './Data';
import ServiceRequests from './Requests';

import './Service.scss';

const fakeService = {
  id: 'e0c0e9ff-1a58-4d66-ab38-3bfa35525516',
  description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
  logoUri: 'https://static.misakey.com/application-logo/google.fr/9c165e1e8032921866e4585d7d4310e4.png',
  mainDomain: 'google.fr',
  name: 'Google',
};

function Service({ match, entity, userId }) {
  return (
    <Screen className="Service">
      <Switch>
        <RouteService
          component={ServiceClaim}
          componentProps={{ entity: fakeService, name: 'ServiceClaim', userId }}
        />
        <RouteService
          path={routes.service.information._}
          component={ServiceInformation}
          componentProps={{ entity, name: 'ServiceInformation' }}
        />
        <RouteService
          path={routes.service.sso._}
          component={ServiceSSO}
          componentProps={{ entity, name: 'ServiceSSO' }}
        />
        <RouteService
          path={routes.service.users._}
          component={ServiceUsers}
          componentProps={{ entity, name: 'ServiceUsers' }}
        />
        <RouteService
          path={routes.service.data._}
          component={ServiceData}
          componentProps={{ entity, name: 'ServiceData' }}
        />
        <RouteService
          path={routes.service.requests._}
          component={ServiceRequests}
          componentProps={{ entity, name: 'ServiceRequests' }}
        />
        <RouteService
          exact
          path={match.path}
          component={ServiceHome}
          componentProps={{ entity, name: 'ServiceHome' }}
        />
      </Switch>
    </Screen>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ServiceSchema.propTypes),
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  userId: PropTypes.string,
};

Service.defaultProps = {
  entity: null,
  userId: null,
};

export default connect(
  state => ({
    ...state.screens.Service,
    entity: denormalize(
      state.screens.Service.id,
      ServiceSchema.entity,
      state.entities,
    ),
    userId: !isEmpty(state.auth.id) && parseJwt(state.auth.id).sub,
  }),
)(Service);
