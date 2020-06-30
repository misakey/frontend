import React from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

import Home from 'components/screens/app/Home';
import NotFound from 'components/oldScreens/NotFound';
import Invitation from 'components/screens/app/Invitation';

import Redirect from 'components/dumb/Redirect';
import withIdentity from 'components/smart/withIdentity';
import useFetchSecretBackup from '@misakey/crypto/hooks/useFetchSecretBackup';

const BoxesApp = ({ isFetchingIdentity }) => {
  const { isReady } = useFetchSecretBackup();

  if (isFetchingIdentity || !isReady) {
    return <SplashScreenWithTranslation />;
  }

  return (
    <Switch>
      {/* REDIRECT TO BOXES */}
      <Redirect
        exact
        from={routes._}
        to={routes.boxes._}
      />

      {/* OTHERS */}
      <Route path={[routes.boxes._, routes.accounts._]} component={Home} />
      <Route path={routes.boxes.invitation} component={Invitation} />

      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  );
};

BoxesApp.propTypes = {
  isFetchingIdentity: PropTypes.bool,
};

BoxesApp.defaultProps = {
  isFetchingIdentity: false,
};

export default withIdentity(BoxesApp);
