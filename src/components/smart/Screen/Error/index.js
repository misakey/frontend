import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from 'routes';
import { Trans, withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';

import omit from '@misakey/helpers/omit';
import BoxControls from '@misakey/ui/Box/Controls';
import IconButton from '@material-ui/core/IconButton';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Title from '@misakey/ui/Typography/Title';

import Box from '@material-ui/core/Box';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';

import { Container } from '@material-ui/core';
import Subtitle from 'packages/ui/src/Typography/Subtitle';
import { FEEDBACK } from 'constants/emails';
import FooterFullScreen from 'components/dumb/Footer/FullScreen';

// CONSTANTS
const APPBAR_HEIGHT = 64;

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    height: `calc(100% - ${APPBAR_HEIGHT}px)`,
  },
}));

function ScreenError({ t, className, children, hideDefaultError, hideRefreshAction, ...rest }) {
  const classes = useStyles();
  return (
    <>
      <AppBar elevation={0} position="static" color="transparent">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={routes._}
          >
            <ArrowBack />
          </IconButton>
          <Typography>{t('components:ScreenError.button.goback')}</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" className={classes.container}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height="100%"
          className={clsx('ErrorBoundary', className)}
          {...omit(rest, ['tReady', 'i18n'])}
        >
          {!hideDefaultError && (
            <>
              <Trans i18nKey="components:ScreenError.title">
                <Title align="center" color="secondary">
                  Oups ...
                </Title>
                <Title align="center">
                  Une erreur s&apos;est produite lors de la navigation
                </Title>
              </Trans>
              <Subtitle align="center">
                <Trans i18nKey="components:ScreenError.subtitle">
                  Vous pouvez essayer de rafraichir la page. Si l&apos;erreur persiste,
                  <MuiLink href={`mailto:${FEEDBACK}`} color="secondary">{' contactez-nous'}</MuiLink>
                  .
                </Trans>
              </Subtitle>
            </>
          )}
          {children}
          {!hideRefreshAction && (
            <BoxControls
              m={2}
              primary={{
                onClick: () => { window.location.reload(); },
                text: t('components:ScreenError.button.refresh'),
              }}
            />
          )}
        </Box>
      </Container>
      <FooterFullScreen />
    </>
  );
}

ScreenError.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hideDefaultError: PropTypes.bool,
  hideRefreshAction: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

ScreenError.defaultProps = {
  children: null,
  className: '',
  hideDefaultError: false,
  hideRefreshAction: false,
};


export default withTranslation('components')(ScreenError);
