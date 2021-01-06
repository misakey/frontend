import PropTypes from 'prop-types';

import { REVERSE, DARKER } from '@misakey/ui/theme';

import { useMemo } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import MuiIconButton from '@material-ui/core/IconButton';

// HELPERS
const isReverse = (color) => color === REVERSE;
const isDarker = (color) => color === DARKER;

// COMPONENTS
const IconButton = withStyles((theme) => ({
  root: ({ color }) => {
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
    () => (isReverse(color) || isDarker(color) ? undefined : color),
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
