import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';
import ServiceSchema from 'store/schemas/Service';

import ServiceRequestsList from 'components/screens/DPO/Service/Requests/List';
import ServiceRequestsRead from 'components/screens/DPO/Service/Requests/Read';

export const SERVICE_REQUESTS_SCREEN_NAMES = {
  READ: 'ServiceRequestsRead',
  LIST: 'ServiceRequestsList',
};

function ServiceRequests({ match: { path }, service }) {
  return (
    <section className="ServiceRequests">
      <Switch>
        <Route
          path={routes.dpo.service.requests.read}
          component={ServiceRequestsRead}
        />
        <Route
          exact
          path={path}
          render={(routerProps) => <ServiceRequestsList service={service} {...routerProps} />}
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
