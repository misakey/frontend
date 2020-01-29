import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import NotFound from 'components/screens/NotFound';

import PluginRefreshWarning from 'components/smart/Plugin/Warning/Refresh';

const Citizen = lazy(() => import('components/screens/Citizen'));

const Plugin = lazy(() => import('components/screens/Plugin'));
const ThirdPartySetup = lazy(() => import('components/screens/Citizen/Application/ThirdPartySetup'));

const PluginApp = () => (
  <>
    <PluginRefreshWarning />
    <Switch>
      <Route exact path={routes.plugin} component={Plugin} />
      <Route path={routes.citizen._} component={Citizen} />
      { /* @FIXME: move with other account routes when save profile will be implemented */}
      <Route
        exact
        path={routes.account.thirdParty.setup}
        render={(routerProps) => <ThirdPartySetup {...routerProps} />}
      />
      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  </>
);

PluginApp.propTypes = {
  t: PropTypes.func.isRequired,
};

export default PluginApp;
