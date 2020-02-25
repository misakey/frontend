import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import Service from 'components/screens/DPO/Service';
import Home from 'components/screens/DPO/Home';
import ServiceCreate from 'components/screens/DPO/Services/Create';

function DPO({ match }) {
  return (
    <Switch>
      <Route path={routes.dpo.services.create} component={ServiceCreate} />
      <Route path={routes.dpo.service._} component={Service} />
      <Route exact path={match.path} component={Home} />
    </Switch>
  );
}

DPO.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default DPO;
