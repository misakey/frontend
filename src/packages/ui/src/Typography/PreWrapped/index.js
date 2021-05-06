import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles(() => ({
  preWrapped: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
}));

// COMPONENTS
const TypographyPreWrapped = ({ className, ...props }) => {
  const classes = useStyles();

  return (
    <Typography className={clsx(className, classes.preWrapped)} {...props} />);
};

TypographyPreWrapped.propTypes = {
  className: PropTypes.string,
};

TypographyPreWrapped.defaultProps = {
  className: '',
};

export default TypographyPreWrapped;
