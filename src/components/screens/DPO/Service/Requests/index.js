import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import routes from 'routes';

import ServiceRequestsList from 'components/screens/DPO/Service/Requests/List';
import ServiceRequestsRead from 'components/screens/DPO/Service/Requests/Read';

export const SERVICE_REQUESTS_SCREEN_NAMES = {
  READ: 'ServiceRequestsRead',
  LIST: 'ServiceRequestsList',
};

function ServiceRequests({ match: { path }, ...rest }) {
  return (
    <Switch>
      <Route
        path={routes.dpo.service.requests.read}
        render={(routerProps) => <ServiceRequestsRead {...rest} {...routerProps} />}
      />
      <Route
        exact
        path={path}
        render={(routerProps) => <ServiceRequestsList {...rest} {...routerProps} />}
      />
    </Switch>
  );
}

ServiceRequests.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
  }).isRequired,
};

export default ServiceRequests;
