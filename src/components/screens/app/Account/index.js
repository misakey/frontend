import React from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { withTranslation } from 'react-i18next';

import ScreenDrawer from 'components/smart/Screen/Drawer';
import AccountRead from 'components/screens/app/Account/Read';

import makeStyles from '@material-ui/core/styles/makeStyles';
import DrawerAccountContent from 'components/smart/Drawer/Account/Content';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
    overflow: 'auto',
  },
}));

// COMPONENTS
function Account({ match, ...props }) {
  const classes = useStyles();

  return (
    <ScreenDrawer
      classes={{ content: classes.drawerContent }}
      drawerChildren={
        (drawerProps) => <DrawerAccountContent backTo={routes.boxes._} {...drawerProps} />
      }
      {...props}
    >
      {(drawerProps) => <AccountRead {...drawerProps} />}
    </ScreenDrawer>
  );
}


Account.propTypes = {
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

export default withTranslation('account')(Account);
