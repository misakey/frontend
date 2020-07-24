import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/screens/app/Home';
import NotFound from 'components/oldScreens/NotFound';
import Invitation from 'components/screens/app/Invitation';
import Redirect from 'components/dumb/Redirect';
import withIdentity from 'components/smart/withIdentity';
import useLoadSecretsFromShares from '@misakey/crypto/hooks/useLoadSecretsFromShares';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

const BoxesApp = ({ isFetchingIdentity }) => {
  const { isFetchingBackupKeyShare } = useLoadSecretsFromShares();

  if (isFetchingIdentity || isFetchingBackupKeyShare) {
    return <SplashScreen />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
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
    </Suspense>

  );
};

BoxesApp.propTypes = {
  isFetchingIdentity: PropTypes.bool,
};

BoxesApp.defaultProps = {
  isFetchingIdentity: false,
};

export default withIdentity(BoxesApp);
