import React, { lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import SearchApplications from 'components/smart/Search/Applications';

import routes from 'routes';

// CONSTANTS
const POPOVER_PROPS = {
  fixedHeight: true,
};

// LAZY
const ApplicationsCreate = lazy(() => import('components/screens/Citizen/Applications/Create'));
const ApplicationsCategoryScreen = lazy(
  () => import('components/screens/Citizen/Applications/Category'),
);
const ApplicationsCategoriesScreen = lazy(
  () => import('components/screens/Citizen/Applications/Categories'),
);

function CitizenApplications({ match }) {
  return (
    <>
      <SearchApplications popoverProps={POPOVER_PROPS} />
      <Switch>
        <RoutePrivate
          path={routes.citizen.applications.create}
          component={ApplicationsCreate}
        />
        <Route
          path={routes.citizen.applications.category}
          component={ApplicationsCategoryScreen}
        />
        <Route exact from={match.path} component={ApplicationsCategoriesScreen} />
      </Switch>
    </>
  );
}


CitizenApplications.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default CitizenApplications;
