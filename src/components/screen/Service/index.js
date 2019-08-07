import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';

import Screen from 'components/screen';
import ServiceHome from './Home';
import ServiceDetails from './Details';
import ServiceSSO from './SSO';
import ServiceUsers from './Users';
import ServiceData from './Data';
import ServiceRequests from './Requests';

function Service({ match/* , entity, updatedAt */ }) {
  return (
    <Screen className="Service">
      <Switch>
        <Route path={routes.service.details} component={ServiceDetails} />
        <Route path={routes.service.sso} component={ServiceSSO} />
        <Route path={routes.service.users} component={ServiceUsers} />
        <Route path={routes.service.data} component={ServiceData} />
        <Route path={routes.service.requests} component={ServiceRequests} />
        <Route exact path={match.path} component={ServiceHome} />
      </Switch>
    </Screen>
  );
}

Service.propTypes = {
  // entity: ServiceSchema.propTypes,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  // updatedAt: PropTypes.string,
};

Service.defaultProps = {
  // entity: null,
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
