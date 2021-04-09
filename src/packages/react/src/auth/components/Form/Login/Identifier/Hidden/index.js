import React from 'react';
import PropTypes from 'prop-types';

import { AUTOFILL_USERNAME } from '@misakey/ui/constants/autofill';

import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    display: 'none',
  },
}));

// COMPONENTS
const LoginIdentifierFormFieldHidden = ({ value, ...props }) => {
  const classes = useStyles();
  return (
    <input
      className={classes.root}
      type="email"
      {...AUTOFILL_USERNAME}
      name="username"
      value={value}
      readOnly
      {...props}
      aria-hidden
    />
  );
};

LoginIdentifierFormFieldHidden.propTypes = {
  value: PropTypes.string.isRequired,
};

export default LoginIdentifierFormFieldHidden;
