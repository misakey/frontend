import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import RouteCitizen from 'components/smart/Route/Citizen';


import routes from 'routes';

import NotFound from 'components/screens/NotFound';
import Application from 'components/screens/Citizen/Application';

// LAZY
const ApplicationsCreate = lazy(() => import('components/screens/Citizen/Applications/Create'));

function Citizen({ match }) {
  return (
    <Switch>
      <RouteCitizen
        isPrivate
        path={routes.citizen.applications.create}
        component={ApplicationsCreate}
      />
      <RouteCitizen path={routes.citizen.application._} component={Application} />
      <RouteCitizen exact path={match.path} component={NotFound} />
    </Switch>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Citizen;
