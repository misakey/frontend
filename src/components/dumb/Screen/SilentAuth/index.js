import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';

import { withUserManager } from '@misakey/auth/components/OidcProvider';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { redirectToApp } from '@misakey/helpers/plugin';

import Container from '@material-ui/core/Container';

import Screen from 'components/dumb/Screen';
import CardSimpleText from 'components/dumb/Card/Simple/Text';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import { DEFAULT_SCOPE } from 'constants/Roles';
import { IS_PLUGIN } from 'constants/plugin';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

// COMPONENTS
function SilentAuthScreen({ requiredScope, userEmail, userManager, t }) {
  const workspace = useLocationWorkspace();
  const classes = useStyles();
  const [loginAsScreen, setLoginAsScreen] = useState(false);

  const scope = useMemo(
    () => (isNil(requiredScope) ? DEFAULT_SCOPE : `${DEFAULT_SCOPE} ${requiredScope}`),
    [requiredScope],
  );

  const authProps = useMemo(
    () => (!isNil(userEmail) ? objectToSnakeCase({ loginHint: userEmail, scope }) : { scope }),
    [scope, userEmail],
  );

  const signInAs = useCallback(
    () => {
      if (IS_PLUGIN) { return redirectToApp(routes.auth.redirectToSignIn); }
      return userManager.signinRedirect(authProps);
    },
    [authProps, userManager],
  );

  const signInSilent = useCallback(
    () => userManager.signinSilent({ scope }),
    [scope, userManager],
  );

  const onSignInSilentSuccess = useCallback(
    () => log(`Signin silent as ${scope} succeeded`),
    [scope],
  );

  const onSignInSilentError = useCallback(
    (err) => {
      log(`Signin silent as ${scope} failed ${err}`);
      setLoginAsScreen(true);
    },
    [scope],
  );

  const { isFetching: loginInProgress, wrappedFetch: signInAsSilent } = useFetchCallback(
    signInSilent,
    { onSucces: onSignInSilentSuccess, onError: onSignInSilentError },
  );

  if (loginAsScreen || loginInProgress) {
    return (
      <Screen state={{ isLoading: loginInProgress }}>
        <Container className={classes.container} maxWidth="md">
          <CardSimpleText
            text={t(`components__new:silentAuth.text.${workspace}`)}
            button={{
              standing: BUTTON_STANDINGS.MAIN,
              text: t('components__new:silentAuth.button'),
              onClick: signInAs,
            }}
          />
        </Container>
      </Screen>
    );
  }

  if (window.env.AUTH.automaticSilentRenew === false) {
    setLoginAsScreen(true);
    return null;
  }

  signInAsSilent();
  return null;
}

SilentAuthScreen.propTypes = {
  userEmail: PropTypes.string,
  userManager: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  requiredScope: PropTypes.string,
};

SilentAuthScreen.defaultProps = {
  requiredScope: null,
  userEmail: null,
};

// CONNECT
const mapStateToProps = (state) => {
  const { email } = state.auth.profile || {};
  return { userEmail: email };
};

export default connect(mapStateToProps, {})(withTranslation('components__new')(withUserManager(SilentAuthScreen)));
