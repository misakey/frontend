import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';

import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';

// HOOKS
const useStyles = makeStyles(() => ({
  code: {
    fontFamily: 'monospace',
  },
}));

// COMPONENTS
const TypographyPreWrappedCode = ({ className, ...props }) => {
  const classes = useStyles();

  return (
    <TypographyPreWrapped className={clsx(classes.code, className)} {...props} />
  );
};

TypographyPreWrappedCode.propTypes = {
  className: PropTypes.string,
};

TypographyPreWrappedCode.defaultProps = {
  className: '',
};

export default TypographyPreWrappedCode;
