import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import RouteCitizen from 'components/smart/Route/Citizen';

import ContactMultipleButton from 'components/smart/Fab/Contact';

import routes from 'routes';

import Application from 'components/screens/Citizen/Application';

// LAZY
const ApplicationsCreate = lazy(() => import('components/screens/Citizen/Applications/Create'));
const Home = lazy(() => import('components/screens/Citizen/Home'));
const Contact = lazy(() => import('components/screens/Citizen/Contact'));
const ApplicationsCategoryScreen = lazy(
  () => import('components/screens/Citizen/Applications/Category'),
);
const ApplicationsCategoriesScreen = lazy(
  () => import('components/screens/Citizen/Applications/Categories'),
);

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
        <RouteCitizen
          path={routes.citizen.applications.categories}
          component={ApplicationsCategoriesScreen}
        />
        <RouteCitizen
          path={routes.citizen.applications.category}
          component={ApplicationsCategoryScreen}
        />
        <RouteCitizen path={routes.citizen.application._} component={Application} />

        <RouteCitizen exact path={match.path} component={Home} />
      </Switch>
    </>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Citizen;
