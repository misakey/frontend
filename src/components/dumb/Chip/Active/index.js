import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Chip from '@material-ui/core/Chip';

// HOOKS
const useStyles = makeStyles((theme) => ({
  chipRoot: {
    margin: theme.spacing(1, 0.5),
  },
}));

// COMPONENTS
const ChipActive = ({
  value,
  activeValue,
  ...rest
}) => {
  const classes = useStyles();

  const isActive = useMemo(
    () => (isNil(activeValue) ? false : value === activeValue),
    [activeValue, value],
  );

  return (
    <Chip
      classes={{ root: classes.chipRoot }}
      color={isActive ? 'primary' : 'default'}
      {...rest}
    />
  );
};

ChipActive.propTypes = {
  value: PropTypes.string.isRequired,
  activeValue: PropTypes.string.isRequired,
};

export default ChipActive;
