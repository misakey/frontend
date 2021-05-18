import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import isEmpty from '@misakey/core/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';
import Icon from '@material-ui/core/Icon';
import green from '@material-ui/core/colors/green';
import orange from '@material-ui/core/colors/orange';
import lightBlue from '@material-ui/core/colors/lightBlue';
import ceriseRed from '@misakey/ui/colors/ceriseRed';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import BoxSection from '@misakey/ui/Box/Section';
import IconButton from '@material-ui/core/IconButton';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';

import InfoIcon from '@material-ui/icons/Info';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import CloseIcon from '@material-ui/icons/Close';

// CONSTANTS
const ICON_SIZE = 'large';
const ICONS_BY_TYPE = {
  default: InfoIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningIcon,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
  },
  info: {
    backgroundColor: lightBlue[50],
    borderColor: lightBlue[500],
    color: lightBlue[900],
  },
  success: {
    backgroundColor: green[50],
    borderColor: green[500],
    color: green[900],
  },
  error: {
    backgroundColor: ceriseRed[50],
    borderColor: ceriseRed[500],
    color: ceriseRed[900],
  },
  warning: {
    backgroundColor: orange[50],
    borderColor: orange[500],
    color: orange[900],
  },
  icon: {
    opacity: '.75',
    marginRight: theme.spacing(2),
  },
}));

const BoxMessage = forwardRef(({
  children,
  className, classes: { root, icon: iconClasses, text: textClasses },
  typographyProps,
  icon, text, type,
  isLoading, onClose, ...rest
}, ref) => {
  const internalClasses = useStyles();
  return (
    <Grow in>
      <BoxSection
        ref={ref}
        className={clsx(
          internalClasses.root, internalClasses[type], className, root,
        )}
        {...rest}
      >
        <Icon
          component={isNil(icon) ? ICONS_BY_TYPE[type] : icon}
          className={clsx(internalClasses.icon, iconClasses)}
          fontSize={ICON_SIZE}
        />
        {!isEmpty(text) && (
          <Typography
            className={clsx(internalClasses.text, textClasses)}
            color="inherit"
            gutterBottom={children}
            {...typographyProps}
          >
            {text}
          </Typography>
        )}
        {children}
        {isLoading && <SplashScreen variant="backdrop" />}
        <BoxFlexFill />
        {isFunction(onClose) && (
          <IconButton color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </BoxSection>
    </Grow>
  );
});

BoxMessage.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.shape({
    root: PropTypes.string,
    icon: PropTypes.string,
    text: PropTypes.string,
  }),
  typographyProps: PropTypes.object,
  className: PropTypes.string,
  icon: PropTypes.elementType,
  isLoading: PropTypes.bool,
  text: PropTypes.string,
  type: PropTypes.oneOf(['default', 'info', 'success', 'error', 'warning']),
  onClose: PropTypes.func,
};

BoxMessage.defaultProps = {
  children: null,
  classes: {},
  typographyProps: {},
  className: '',
  icon: null,
  isLoading: false,
  text: '',
  type: 'default',
  onClose: null,
};

export default BoxMessage;
