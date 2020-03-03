import React, { lazy } from 'react';
import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

const Citizen = lazy(() => import('components/screens/Citizen'));

const DefaultScreen = lazy(() => import('components/screens/Plugin/Default'));
const PluginRedirectToCurrent = lazy(() => import('components/smart/Plugin/RedirectToCurrent'));

const PluginApp = () => (
  <>
    <Switch>
      <Route exact path={routes.plugin._} component={PluginRedirectToCurrent} />
      <Route path={routes.citizen._} component={Citizen} />
      {/* DEFAULT */}
      <Route path={routes.plugin.blank} component={DefaultScreen} />
      <Route component={DefaultScreen} />
    </Switch>
  </>
);

export default PluginApp;
