import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

// HOOKS
const useStyles = makeStyles(() => ({
  fab: {
    position: 'absolute',
    bottom: 35,
    right: 35,
  },
}));


const FabAdd = ({ ...props }) => {
  const classes = useStyles();
  return (
    <Fab
      className={classes.fab}
      color="secondary"
      aria-label="add"
      {...props}
    >
      <AddIcon />
    </Fab>
  );
};


export default FabAdd;
