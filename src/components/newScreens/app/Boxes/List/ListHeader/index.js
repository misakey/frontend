import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import CreateBoxDialog from 'components/smart/Dialog/Boxes/Create';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import AddIcon from '@material-ui/icons/Add';

const ACCOUNT = 'account';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

function ListHeader({ drawerWidth, getNextDrawerSearch }) {
  const classes = useStyles();
  const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false);

  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true),
    [getNextDrawerSearch],
  );

  const toggleIsDialogCreateOpen = useCallback(
    () => { setIsDialogCreateOpen((current) => !current); }, [],
  );

  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
        <IconButtonAppBar
          aria-label="user-account"
          component={Link}
          to={openAccountDrawer}
          edge="start"
        >
          <UserAccountAvatar classes={{ root: classes.avatar }} />
        </IconButtonAppBar>
        <TabsMenu />
        <IconButtonAppBar
          aria-label="create-box"
          edge="end"
          color="secondary"
          onClick={toggleIsDialogCreateOpen}
        >
          <AddIcon />
        </IconButtonAppBar>
        <CreateBoxDialog open={isDialogCreateOpen} onClose={toggleIsDialogCreateOpen} />
      </AppBarDrawer>
    </>
  );
}

ListHeader.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
};

export default withTranslation(['common'])(ListHeader);
