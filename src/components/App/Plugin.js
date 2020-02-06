import React, { lazy } from 'react';
import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import PluginRefreshWarning from 'components/smart/Plugin/Warning/Refresh';

const Citizen = lazy(() => import('components/screens/Citizen'));

const ThirdPartySetup = lazy(() => import('components/screens/Citizen/Application/ThirdPartySetup'));
const DefaultScreen = lazy(() => import('components/screens/Plugin/Default'));
const PluginRedirectToCurrent = lazy(() => import('components/smart/Plugin/RedirectToCurrent'));

const PluginApp = () => (
  <>
    <PluginRefreshWarning />
    <Switch>
      <Route exact path={routes.plugin._} component={PluginRedirectToCurrent} />
      <Route path={routes.citizen._} component={Citizen} />
      { /* @FIXME: move with other account routes when save profile will be implemented */}
      <Route
        exact
        path={routes.account.thirdParty.setup}
        render={(routerProps) => <ThirdPartySetup {...routerProps} />}
      />
      {/* DEFAULT */}
      <Route path={routes.plugin.blank} component={DefaultScreen} />
      <Route component={DefaultScreen} />
    </Switch>
  </>
);

export default PluginApp;
