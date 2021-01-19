import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';

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
  children, className, icon, isLoading, text, type, onClose, ...rest
}, ref) => {
  const classes = useStyles();
  return (
    <Grow in>
      <BoxSection ref={ref} className={clsx(classes.root, classes[type], className)} {...rest}>
        <Icon
          component={isNil(icon) ? ICONS_BY_TYPE[type] : icon}
          className={classes.icon}
          fontSize={ICON_SIZE}
        />
        {!isEmpty(text) && (
        <Typography className={classes.text} color="inherit" gutterBottom={children}>
          {text}
        </Typography>
        )}
        {children}
        {isLoading && <SplashScreen variant="backdrop" />}
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
  classes: PropTypes.objectOf(PropTypes.string),
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
  className: '',
  icon: null,
  isLoading: false,
  text: '',
  type: 'default',
  onClose: null,
};

export default BoxMessage;
