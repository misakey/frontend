import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
// import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import AddIcon from '@material-ui/icons/Add';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import withDialogPassword from 'components/smart/Dialog/Password/with';

const IconButtonCreate = withDialogCreate(withDialogPassword(IconButtonAppBar));
const ACCOUNT = 'account';

const useStyles = makeStyles((theme) => ({
  flexGrow: {
    flexGrow: 1,
  },
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

function ListHeader({ drawerWidth, getNextDrawerSearch, t }) {
  const classes = useStyles();
  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true),
    [getNextDrawerSearch],
  );

  return (
    <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
      <IconButtonAppBar
        aria-label={t('common:openAccountDrawer')}
        component={Link}
        to={openAccountDrawer}
        edge="start"
      >
        <UserAccountAvatar classes={{ root: classes.avatar }} />
      </IconButtonAppBar>
      {/* Uncomment when accounts are implemented */}
      {/* <TabsMenu /> */}
      <div className={classes.flexGrow} />
      <IconButtonCreate
        aria-label={t('boxes:list.empty.create')}
        edge="end"
        color="secondary"
      >
        <AddIcon />
      </IconButtonCreate>
    </AppBarDrawer>
  );
}

ListHeader.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
