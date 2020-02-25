import React, { lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import isNil from '@misakey/helpers/isNil';

import ContactMultipleButton from 'components/smart/Fab/Contact';

import routes from 'routes';

import Application from 'components/screens/Citizen/Application';
import SilentAuthScreen from 'components/dumb/Screen/SilentAuth';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';
import { connect } from 'react-redux';

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

function Citizen({ match, isAuthenticated, userScope }) {
  const scopeIsAllowed = useMemo(
    () => !isNil(userScope) && !userScope.includes(`${ROLE_PREFIX_SCOPE}.`),
    [userScope],
  );
  if (isAuthenticated && !scopeIsAllowed) {
    return <SilentAuthScreen />;
  }

  return (
    <>
      <ContactMultipleButton />
      <Switch>
        <RoutePrivate path={routes.citizen.contact._} component={Contact} />
        <RoutePrivate
          path={routes.citizen.applications.create}
          component={ApplicationsCreate}
        />
        <Route
          path={routes.citizen.applications.categories}
          component={ApplicationsCategoriesScreen}
        />
        <Route
          path={routes.citizen.applications.category}
          component={ApplicationsCategoryScreen}
        />
        <Route path={routes.citizen.application._} component={Application} />

        <Route exact path={match.path} component={Home} />
      </Switch>
    </>
  );
}

Citizen.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  isAuthenticated: PropTypes.bool,
  userScope: PropTypes.string,
};


Citizen.defaultProps = {
  isAuthenticated: false,
  userScope: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  userScope: state.auth.scope,
});

export default connect(mapStateToProps, {})(Citizen);
