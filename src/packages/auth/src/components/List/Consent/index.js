import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import List from '@material-ui/core/List';
import ListItemTOS from '@misakey/auth/components/ListItem/TOS';
import ListItemPrivacy from '@misakey/auth/components/ListItem/Privacy';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listRoot: {
    width: '100%',
  },
  listItemContainer: {
    margin: theme.spacing(1, 0),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

// COMPONENTS
const ListConsent = (props) => {
  const classes = useStyles();

  return (
    <List classes={{ root: classes.listRoot }} {...props}>
      <ListItemTOS classes={{ container: classes.listItemContainer }} />
      <ListItemPrivacy classes={{ container: classes.listItemContainer }} />
    </List>
  );
};

export default ListConsent;
