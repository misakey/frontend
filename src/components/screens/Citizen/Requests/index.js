import React from 'react';
import { Switch } from 'react-router-dom';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RequestRead from 'components/screens/Citizen/Requests/Read';

import routes from 'routes';

function Requests() {
  return (
    <Switch>
      <RoutePrivate
        path={routes.citizen.requests.read}
        component={RequestRead}
      />
    </Switch>
  );
}

export default Requests;
