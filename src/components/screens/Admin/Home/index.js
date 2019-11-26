import React from 'react';
import Redirect from 'components/dumb/Redirect';
import generatePath from '@misakey/helpers/generatePath';
import routes from 'routes';

function Home() {
  return <Redirect to={generatePath(routes.admin.service.home._, { mainDomain: 'intro' })} />;
}

export default Home;
