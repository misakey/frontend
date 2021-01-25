import React from 'react';
import { AUTOFILL_PASSWORD } from '@misakey/ui/constants/autofill';

import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    display: 'none',
  },
}));

// COMPONENTS
const LoginSecretFormFieldHidden = (props) => {
  const classes = useStyles();
  return (
    <input
      className={classes.root}
      type="password"
      {...AUTOFILL_PASSWORD}
      name="password"
      {...props}
      aria-hidden
    />
  );
};


export default LoginSecretFormFieldHidden;
