import React from 'react';
import PropTypes from 'prop-types';

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
const ListConsent = ({ tosUri, policyUri, id, name, logoUri, ...props }) => {
  const classes = useStyles();

  return (
    <List classes={{ root: classes.listRoot }} {...props}>
      {tosUri
      && <ListItemTOS classes={{ container: classes.listItemContainer }} href={tosUri} />}
      {policyUri
        && <ListItemPrivacy classes={{ container: classes.listItemContainer }} href={policyUri} />}
    </List>
  );
};

ListConsent.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  logoUri: PropTypes.string,
  tosUri: PropTypes.string,
  policyUri: PropTypes.string,
};

ListConsent.defaultProps = {
  id: null,
  name: null,
  logoUri: null,
  tosUri: null,
  policyUri: null,
};

export default ListConsent;
