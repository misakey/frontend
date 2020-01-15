import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import RouteCitizen from 'components/smart/Route/Citizen';

import ContactMultipleButton from 'components/smart/Fab/Contact';

import routes from 'routes';

import Application from 'components/screens/Citizen/Application';

// LAZY
const ApplicationsCreate = lazy(() => import('components/screens/Citizen/Applications/Create'));
const Landing = lazy(() => import('components/screens/Landing'));
const Contact = lazy(() => import('components/screens/Citizen/Contact'));

function Citizen({ match }) {
  return (
    <>
      <ContactMultipleButton />
      <Switch>
        <RouteCitizen isPrivate path={routes.citizen.contact._} component={Contact} />
        <RouteCitizen
          isPrivate
          path={routes.citizen.applications.create}
          component={ApplicationsCreate}
        />
        <RouteCitizen path={routes.citizen.application._} component={Application} />
        <RouteCitizen exact path={match.path} component={Landing} />
      </Switch>
    </>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Citizen;
