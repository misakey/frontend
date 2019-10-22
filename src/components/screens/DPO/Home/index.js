import React from 'react';
import Redirect from '@misakey/ui/Redirect';
import generatePath from '@misakey/helpers/generatePath';
import routes from 'routes';

function Home() {
  return <Redirect to={generatePath(routes.dpo.service.requests._, { mainDomain: 'service' })} />;
}

export default Home;
