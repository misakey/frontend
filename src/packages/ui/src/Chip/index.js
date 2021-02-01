import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';


import withStyles from '@material-ui/core/styles/withStyles';
import MuiChip from '@material-ui/core/Chip';

// HELPERS
const isError = (color) => color === 'error';

// COMPONENTS
let Chip = ({ color, ...rest }, ref) => {
  const cleanColor = useMemo(
    () => (isError(color) ? undefined : color),
    [color],
  );
  return <MuiChip ref={ref} {...rest} color={cleanColor} />;
};

Chip = forwardRef(Chip);

Chip.propTypes = {
  color: PropTypes.string,
};

Chip.defaultProps = {
  color: 'default',
};

export default withStyles((theme) => ({
  root: ({ color }) => {
    if (isError(color)) {
      return {
        color: theme.palette.error.main,
      };
    }
    return {};
  },
}))(Chip);
