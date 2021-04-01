import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';

import propOr from '@misakey/core/helpers/propOr';
import isNil from '@misakey/core/helpers/isNil';
import __ from '@misakey/core/helpers/__';
import { fade } from '@material-ui/core/styles/colorManipulator';
import withStyles from '@material-ui/core/styles/withStyles';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import MUIButton from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

// CONSTANTS
export const BUTTON_STANDINGS = {
  MAIN: 'main',
  OUTLINED: 'outlined',
  TEXT: 'text',
  CANCEL: 'cancel',
};

const BUTTON_PROPS_BY_STANDING = {
  [BUTTON_STANDINGS.MAIN]: {
    variant: 'contained',
    color: 'primary',
  },
  [BUTTON_STANDINGS.OUTLINED]: {
    variant: 'outlined',
    color: 'primary',
  },
  [BUTTON_STANDINGS.TEXT]: {
    variant: 'text',
    color: 'primary',
  },
  [BUTTON_STANDINGS.CANCEL]: {
    variant: 'text',
    color: 'default',
  },
};

// HELPERS
const isBackground = (color) => color === 'background';
const propOrEmpty = propOr({}, __, BUTTON_PROPS_BY_STANDING);

const getStandingProps = (standing, color) => {
  if (isNil(color)) {
    return propOrEmpty(standing);
  }
  const cleanColor = isBackground(color) ? undefined : color;
  return { ...propOrEmpty(standing), color: cleanColor };
};

const makeStyles = (theme) => ({
  wrapper: {
    position: 'relative',
  },
  root: { width: '100%' },
  text: ({ color }) => (isBackground(color) ? {
    color: theme.palette.background.paper,
    '&.Mui-disabled': {
      color: fade(theme.palette.background.paper, 0.26),
    },
  } : {}),
  outlined: ({ color }) => (isBackground(color) ? {
    color: theme.palette.background.paper,
    border: `1px solid ${fade(theme.palette.background.paper, 0.5)}`,
    '&:hover': {
      border: `1px solid ${theme.palette.background.paper}`,
      backgroundColor: fade(theme.palette.background.paper, theme.palette.action.hoverOpacity),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-disabled': {
      border: `1px solid ${fade(theme.palette.background.paper, 0.12)}`,
      color: fade(theme.palette.background.paper, 0.26),
    },
  } : {}),
  contained: ({ color }) => (isBackground(color) ? {
    color: theme.palette.getContrastText(theme.palette.background.paper),
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.background.darker,
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.palette.background.paper,
      },
    },
    '&.Mui-disabled': {
      backgroundColor: fade(theme.palette.background.paper, 0.12),
      color: fade(theme.palette.background.paper, 0.26),
    },
  } : {}),
  label: ({ isLoading }) => ({
    color: isLoading ? 'transparent' : null,
    whiteSpace: 'nowrap',
  }),
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

// COMPONENTS
const Button = forwardRef(({
  classes,
  isLoading,
  disabled,
  text,
  progressProps,
  standing,
  color,
  ...rest
}, ref) => {
  const disabledOrLoading = useMemo(() => disabled || isLoading, [disabled, isLoading]);

  const standingProps = useMemo(
    () => getStandingProps(standing, color),
    [standing, color],
  );

  const { wrapper, buttonProgress, ...restClasses } = useSafeDestr(classes);

  return (
    <span className={wrapper}>
      <MUIButton
        ref={ref}
        classes={restClasses}
        {...standingProps}
        disabled={disabledOrLoading}
        {...rest}
      >
        {text}
      </MUIButton>
      {isLoading && (
        <CircularProgress size={24} className={buttonProgress} {...progressProps} />
      )}
    </span>
  );
});

Button.propTypes = {
  classes: PropTypes.shape({
    wrapper: PropTypes.string,
    root: PropTypes.string,
    label: PropTypes.string,
    buttonProgress: PropTypes.string,
    text: PropTypes.string,
    outlined: PropTypes.string,
    contained: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
  progressProps: PropTypes.object,
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  color: PropTypes.string,
  text: PropTypes.node.isRequired,
};

Button.defaultProps = {
  classes: {
    wrapper: '',
    root: '',
    label: '',
    buttonProgress: '',
  },
  isLoading: false,
  disabled: false,
  progressProps: {},
  color: null,
  standing: BUTTON_STANDINGS.CANCEL,
};

export default withStyles(makeStyles)(Button);
