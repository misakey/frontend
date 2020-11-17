import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import List from '@material-ui/core/List';


// HOOKS
const useStyles = makeStyles((theme) => ({
  listBordered: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

// COMPONENTS
const ListBordered = (props) => {
  const classes = useStyles();

  return (
    <List className={classes.listBordered} {...props} />
  );
};

export default ListBordered;
