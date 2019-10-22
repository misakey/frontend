import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ServiceCreate from 'components/screens/Admin/Service/Create';
import ServiceList from 'components/screens/Admin/Service/List';
import Service from 'components/screens/Admin/Service';
import Home from 'components/screens/Admin/Home';
import RoutePrivate from '@misakey/auth/components/Route/Private';

function Admin({ match }) {
  return (
    <Switch>
      <RoutePrivate exact path={routes.admin.service.create._} component={ServiceCreate} />
      <RoutePrivate exact path={routes.admin.service.list} component={ServiceList} />
      <Route path={routes.admin.service._} component={Service} />
      <Route exact path={match.path} component={Home} />
    </Switch>
  );
}

Admin.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default Admin;
