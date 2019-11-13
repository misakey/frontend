import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import omit from '@misakey/helpers/omit';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import HomeIcon from '@material-ui/icons/Home';

// CONSTANTS
const INTERNAL_PROPS = ['tReady'];

// HOOKS
const useStyles = makeStyles((theme) => ({
  marginRight: theme.spacing(2),
}));

function ButtonGoBack({ className, history: { length, goBack, push }, homePath, t, ...props }) {
  const classes = useStyles();

  const canGoBack = useMemo(
    () => length > 1,
    [length],
  );

  const handleGoHome = useCallback(
    () => {
      push(homePath);
    },
    [push, homePath],
  );

  const handleGoBack = useCallback(
    () => {
      goBack();
    },
    [goBack],
  );

  return (
    <IconButton
      edge="start"
      className={clsx(className, classes)}
      color="inherit"
      aria-label={t('navigation:history.goBack', 'Go back')}
      onClick={canGoBack ? handleGoBack : handleGoHome}
      onKeyPress={canGoBack ? handleGoBack : handleGoHome}
      {...omit(props, INTERNAL_PROPS)}
    >
      {canGoBack ? <ArrowBackIcon /> : <HomeIcon />}
    </IconButton>
  );
}

ButtonGoBack.propTypes = {
  className: PropTypes.string,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    length: PropTypes.number.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  homePath: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ButtonGoBack.defaultProps = {
  className: '',
  homePath: '/',
};

export default withTranslation()(ButtonGoBack);
