import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';
import RouteService from 'components/smart/Route/Service';

import ServiceRequestsList from './List';
import ServiceRequestsRead from './Read';

export const SERVICE_REQUESTS_SCREEN_NAMES = {
  READ: 'ServiceRequestsRead',
  LIST: 'ServiceRequestsList',
};

function ServiceRequests({ match: { path }, service }) {
  return (
    <section className="ServiceRequests">
      <Switch>
        <RouteService
          path={routes.service.requests.read}
          component={ServiceRequestsRead}
          componentProps={{ service, name: SERVICE_REQUESTS_SCREEN_NAMES.READ }}
        />
        <RouteService
          exact
          path={path}
          component={ServiceRequestsList}
          componentProps={{ service, name: SERVICE_REQUESTS_SCREEN_NAMES.LIST }}
        />
      </Switch>
    </section>
  );
}

ServiceRequests.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
  }).isRequired,
  service: PropTypes.shape(ServiceSchema.propTypes),
};

ServiceRequests.defaultProps = {
  service: null,
};

export default ServiceRequests;
