import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import BoxControlsCentered from '@misakey/ui/Box/Controls/Centered';

// HOOKS
const useStyles = makeStyles((theme) => ({
  boxRoot: {
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(0.5),
    },
    '& > *:not(:first-child)': {
      marginTop: theme.spacing(0.5),
    },
  },
}));

// COMPONENTS
const BoxControlsColumn = (props) => {
  const classes = useStyles();

  return (
    <BoxControlsCentered
      flexDirection="column"
      className={classes.boxRoot}
      {...props}
    />
  );
};

export default BoxControlsColumn;
