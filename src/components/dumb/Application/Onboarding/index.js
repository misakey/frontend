import React, { useCallback, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { withTranslation, Trans } from 'react-i18next';
import { withUserManager } from '@misakey/auth/components/OidcProvider';
import { makeStyles } from '@material-ui/core/styles';
import { IS_PLUGIN } from 'constants/plugin';

import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';
import CardSimpleText from 'components/dumb/Card/Simple/Text';

import { FIREFOX_ADDON_URI, CHROME_ADDON_URI } from 'constants/links/addon';

import routes from 'routes';
import { redirectToApp, isPluginDetected } from '@misakey/helpers/plugin';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import CardSimpleDoubleButton from 'components/dumb/Card/Simple/DoubleButton';


const useStyles = makeStyles((theme) => ({
  title: {
    whiteSpace: 'pre-wrap',
  },
  catchphrase: {
    fontSize: `calc(${theme.typography.h5.fontSize} + 1px)`,
    fontWeight: 'bold',
  },
  disabled: {
    border: 'none',
    color: theme.palette.grey[400],
  },
}));

const Onboarding = ({ isAuthenticated, userManager, t }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);

  const isPluginInstalled = useMemo(() => isPluginDetected(), []);

  const signInAction = useCallback(
    (event) => {
      event.preventDefault();
      if (IS_PLUGIN) {
        redirectToApp(routes.auth.redirectToSignIn);
      } else {
        userManager.signinRedirect();
      }
    },
    [userManager],
  );

  const redirectToAppForPlugin = useCallback(() => {
    if (IS_PLUGIN) {
      redirectToApp(routes.citizen.applications.categories);
      window.close();
    }
  }, []);

  const steps = useMemo(() => ([
    <CardSimpleText
      my={1}
      key={1}
      text={t('screens:landing.onboarding.steps.1.text')}
      className={clsx({ [classes.disabled]: activeStep !== 1 })}
      button={activeStep === 1 ? {
        standing: BUTTON_STANDINGS.MAIN,
        text: t('screens:landing.onboarding.steps.1.button'),
        onClick: signInAction,
      } : null}
    />,
    <CardSimpleDoubleButton
      my={1}
      key={2}
      text={t('screens:landing.onboarding.steps.2.text')}
      className={clsx({ [classes.disabled]: activeStep !== 2 })}
      primary={activeStep === 2 ? {
        standing: BUTTON_STANDINGS.MAIN,
        text: t('screens:landing.onboarding.steps.2.firefox'),
        href: FIREFOX_ADDON_URI,
        component: 'a',
      } : null}
      secondary={activeStep === 2 ? {
        standing: BUTTON_STANDINGS.MAIN,
        text: t('screens:landing.onboarding.steps.2.chrome'),
        href: CHROME_ADDON_URI,
        component: 'a',
      } : null}
    />,
    <CardSimpleText
      my={1}
      key={3}
      text={t('screens:landing.onboarding.steps.3.text')}
      className={clsx({ [classes.disabled]: activeStep !== 3 })}
      button={activeStep === 3 ? {
        standing: BUTTON_STANDINGS.MAIN,
        text: t('screens:landing.onboarding.steps.3.button'),
        component: Link,
        to: IS_PLUGIN ? routes.plugin._ : routes.citizen.applications.categories,
        onClick: redirectToAppForPlugin,
      } : null}
    />,
  ]), [activeStep, classes.disabled, redirectToAppForPlugin, signInAction, t]);

  // compute user's step for onboarding
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveStep(1);
    } else if (!isPluginInstalled && !IS_PLUGIN) {
      setActiveStep(2);
    } else {
      setActiveStep(3);
    }
  }, [isAuthenticated, isPluginInstalled]);

  return (
    <Box my={5}>
      <Title className={classes.title}>
        <Trans i18nKey="screens:landing.onboarding.title">
          <span className={classes.catchphrase}>A partir de maintenant,</span>
          {'j\'habitue les sites à me renvoyer mes données à l\'abri des géants de la tech'}
        </Trans>
      </Title>
      {steps}
    </Box>
  );
};

Onboarding.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  userManager: PropTypes.shape({
    signinRedirect: PropTypes.func.isRequired,
  }).isRequired,
};

export default withTranslation('screens')(withUserManager(Onboarding));
