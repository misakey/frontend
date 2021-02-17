import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { REVERSE, DARKER } from '@misakey/ui/theme';

import { fade } from '@material-ui/core/styles/colorManipulator';

import withStyles from '@material-ui/core/styles/withStyles';
import MuiIconButton from '@material-ui/core/IconButton';

// HELPERS
const isReverse = (color) => color === REVERSE;
const isDarker = (color) => color === DARKER;
const isBackground = (color) => color === 'background';

// COMPONENTS
const IconButton = withStyles((theme) => ({
  root: ({ color }) => {
    if (isBackground(color)) {
      return {
        color: theme.palette.background.paper,
        '&.Mui-disabled': {
          color: fade(theme.palette.background.paper, 0.26),
        },
      };
    }
    if (isReverse(color)) {
      return {
        color: theme.palette.reverse.action.active,
        '&.Mui-disabled': {
          color: theme.palette.reverse.action.disabled,
        },
      };
    }
    if (isDarker(color)) {
      return {
        color: theme.palette.darker.action.active,
        '&.Mui-disabled': {
          color: theme.palette.darker.action.disabled,
        },
      };
    }
    return {};
  },
}))(({ color, ...rest }) => {
  const cleanColor = useMemo(
    () => (isReverse(color) || isDarker(color) || isBackground(color) ? undefined : color),
    [color],
  );
  return <MuiIconButton {...rest} color={cleanColor} />;
});

IconButton.propTypes = {
  color: PropTypes.string,
};

IconButton.defaultProps = {
  color: 'default',
};

export default IconButton;
