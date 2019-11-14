import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import RoutePrivate from '@misakey/auth/components/Route/Private';


import routes from 'routes';

import NotFound from 'components/screens/NotFound';
import Application from 'components/screens/Citizen/Application';

// LAZY
const ApplicationsCreate = lazy(() => import('components/screens/Citizen/Applications/Create'));

function Citizen({ match }) {
  return (
    <Switch>
      <RoutePrivate path={routes.citizen.applications.create} component={ApplicationsCreate} />
      <Route path={routes.citizen.application._} component={Application} />
      <Route exact path={match.path} component={NotFound} />
    </Switch>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Citizen;
