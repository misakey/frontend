import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isEmpty from '@misakey/helpers/isEmpty';
import tDefault from '@misakey/helpers/tDefault';

import withStyles from '@material-ui/core/styles/withStyles';
import { fade } from '@material-ui/core/styles/colorManipulator';

import boulder from '@misakey/ui/colors/boulder';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import clsx from 'clsx';

const styles = (theme) => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1100,
    width: '100%',
    height: '100%',
    maxHeight: '100vh',
    color: theme.palette.common.black,
    textAlign: 'center',
    background: boulder[50],
  },
  backdrop: {
    background: fade(boulder[50], 0.85),
  },
  inherit: {
    background: 'transparent',
  },
  svgContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  svg: {
    left: '50%',
    color: theme.palette.secondary,
  },
});

// @UNUSED
const SplashScreen = ({ children, classes, t, text, variant }) => (
  <div className={clsx(classes.root, classes[variant])}>
    <div className={classes.svgContainer}>
      {children || <CircularProgress className={classes.svg} size={50} />}
      <Typography>{!isEmpty(text) ? text : t('loading')}</Typography>
    </div>
  </div>
);

SplashScreen.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]),
  classes: PropTypes.object,
  t: PropTypes.func,
  text: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'backdrop', 'inherit']),
};


SplashScreen.defaultProps = {
  children: null,
  classes: {},
  t: tDefault,
  text: '',
  variant: 'backdrop',
};

export default withTranslation()(withStyles(styles)(SplashScreen));
