import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import TypographyTitle from '@misakey/ui/Typography/Title';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    fontWeight: theme.typography.fontWeightBold,
    flexGrow: 1,
  },
}));

// COMPONENTS
const TypographyTitleBold = (props) => {
  const classes = useStyles();

  return (
    <TypographyTitle className={classes.root} {...props} />
  );
};

export default TypographyTitleBold;
