import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';

import RouteService from 'components/smart/Route/Service';
import Screen from 'components/screen';
import ServiceHome from './Home';
import ServiceInformation from './Information';
import ServiceSSO from './SSO';
import ServiceUsers from './Users';
import ServiceData from './Data';
import ServiceRequests from './Requests';

import './Service.scss';

function Service({ match, entity/* , updatedAt */ }) {
  return (
    <Screen className="Service">
      <Switch>
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
  // updatedAt: PropTypes.string,
};

Service.defaultProps = {
  entity: null,
  // updatedAt: null,
};

export default connect(
  state => ({
    ...state.screens.Service,
    entities: denormalize(
      state.screens.Service.id,
      ServiceSchema.entity,
      state.entities,
    ),
  }),
)(Service);
