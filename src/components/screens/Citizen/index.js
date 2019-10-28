import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import NotFound from 'components/screens/NotFound';
import Application from 'components/screens/Citizen/Application';

// LAZY
const ApplicationLists = lazy(() => import('components/screens/Citizen/ApplicationLists'));

function Citizen({ match }) {
  return (
    <Switch>
      <Route path={routes.citizen.applications} component={ApplicationLists} />
      <Route path={routes.citizen.application._} component={Application} />
      <Route exact path={match.path} component={NotFound} />
    </Switch>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Citizen;
