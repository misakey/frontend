import React from 'react';
import Redirect from 'components/smart/Redirect';
import generatePath from '@misakey/helpers/generatePath';
import routes from 'routes';

function Home() {
  return <Redirect to={generatePath(routes.service.home._, { mainDomain: 'service' })} />;
}

export default Home;
