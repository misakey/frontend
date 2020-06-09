import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import CreateBoxDialog from 'components/smart/Dialog/Boxes/Create';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import getNextSearch from '@misakey/helpers/getNextSearch';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import FilledInput from '@material-ui/core/FilledInput';

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
  search: {
    borderRadius: theme.spacing(0.5),
  },
  input: {
    padding: theme.spacing(1, 2),
  },
}));

function ListHeader({ drawerWidth, getNextDrawerSearch, t }) {
  const classes = useStyles();
  const { search: locationSearch, pathname } = useLocation();
  const { push } = useHistory();
  const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false);

  const openSearch = useCallback(
    () => push({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
    [push, pathname, locationSearch],
  );
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
      <Box m={1}>
        <FilledInput
          classes={{ root: classes.search, input: classes.input }}
          onFocus={openSearch}
          placeholder={t('search')}
          disableUnderline
          fullWidth
          size="small"
          readOnly
        />
      </Box>
    </>
  );
}

ListHeader.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common'])(ListHeader);
