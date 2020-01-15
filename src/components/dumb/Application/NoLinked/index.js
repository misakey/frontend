import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation, Trans } from 'react-i18next';
import { withUserManager } from '@misakey/auth/components/OidcProvider';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Title from 'components/dumb/Typography/Title';

import { FIREFOX_ADDON_URI, CHROME_ADDON_URI } from 'constants/links/addon';

import routes from 'routes';


const useStyles = makeStyles((theme) => ({
  initCryptoLink: {
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
    color: 'inherit',
  },
  responsiveImage: {
    maxWidth: '100%',
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
  },
  responsiveImageWhite: {
    border: '1px solid',
    borderColor: theme.palette.grey[200],
  },
  title: {
    fontWeight: 'bold',
  },
}));

const NoLinkedApplication = ({ isAuthenticated, userManager, t }) => {
  const classes = useStyles();

  const signInAction = useCallback(
    (event) => {
      event.preventDefault();
      userManager.signinRedirect();
    },
    [userManager],
  );

  const faqMyRights = useMemo(() => t('landing.authenticated.myRights'), [t]);

  if (!isAuthenticated) {
    return (
      <Box my={5}>
        <Title className={classes.title}>
          {t('landing.unAuthenticated.title')}
        </Title>
        <Box my={3}>
          <Typography
            component="h2"
            variant="h5"
          >
            <Trans i18nKey="landing.unAuthenticated.1">
              {'1. J\'installe l\'extension Misakey: sur '}
              <Link
                href={FIREFOX_ADDON_URI}
                color="secondary"
                target="_blank"
                rel="noreferrer noopener"
              >
                Firefox
              </Link>
              {' ou '}
              <Link
                href={CHROME_ADDON_URI}
                color="secondary"
                target="_blank"
                rel="noreferrer noopener"
              >
                Chrome
              </Link>
            </Trans>
            <img
              src="/img/illustrations/CTA_plugin_landing.png"
              className={clsx(classes.responsiveImage)}
              alt="Plugin Misakey"
            />
          </Typography>
        </Box>
        <Box my={3}>
          <Typography
            component="h2"
            variant="h5"
          >
            <Trans i18nKey="landing.unAuthenticated.2">
              {'2. Je crée mon compte gratuitement: '}
              <Link onClick={signInAction} color="secondary" href={routes.auth.redirectToSignIn}>
                créer mon compte
              </Link>
            </Trans>
          </Typography>
        </Box>
        <Box my={3}>
          <Typography
            component="h2"
            variant="h5"
          >
            {t('landing.unAuthenticated.3')}
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box my={5} className={classes.box}>
      <Title className={classes.title}>
        {t('landing.authenticated.title')}
      </Title>
      <Box my={3}>
        <Typography
          component="h2"
          variant="h5"
        >
          {t('landing.authenticated.1')}
        </Typography>
      </Box>
      <Box my={3}>
        <Typography
          component="h2"
          variant="h5"
        >
          {t('landing.authenticated.2')}
          <img
            src="/img/illustrations/ask_data_landing.png"
            className={clsx(classes.responsiveImage, classes.responsiveImageWhite)}
            alt="Plugin Misakey"
          />
        </Typography>
      </Box>
      <Box my={3}>
        <Typography
          component="h2"
          variant="h5"
        >
          <Trans
            i18nKey="landing.authenticated.3"
          >
            {'3. Je discute avec le DPO pour faire valoir '}
            <Link href={faqMyRights} color="secondary">
              mes droits
            </Link>
            .
          </Trans>
        </Typography>
      </Box>
    </Box>
  );
};

NoLinkedApplication.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  userManager: PropTypes.shape({
    signinRedirect: PropTypes.func.isRequired,
  }).isRequired,
};

export default withTranslation('screens')(withUserManager(NoLinkedApplication));
