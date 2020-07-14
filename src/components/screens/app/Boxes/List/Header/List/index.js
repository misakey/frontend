import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import STATUSES from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import withDialogPassword from 'components/smart/Dialog/Password/with';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const ACCOUNT = 'account';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

// COMPONENTS
const IconButtonCreate = withDialogCreate(withDialogPassword(IconButtonAppBar));

function ListHeader({ drawerWidth, getNextDrawerSearch, activeStatus, t }) {
  const classes = useStyles();
  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true),
    [getNextDrawerSearch],
  );
  const { search } = useLocationSearchParams();

  const onCreateSuccess = usePaginateBoxesByStatusRefresh(activeStatus, search);

  const dialogProps = useMemo(
    () => ({
      onSuccess: onCreateSuccess,
    }),
    [onCreateSuccess],
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
      <TabsMenu />
      <IconButtonCreate
        aria-label={t('boxes:list.empty.create')}
        edge="end"
        color="secondary"
        dialogProps={dialogProps}
      >
        <AddIcon />
      </IconButtonCreate>
    </AppBarDrawer>
  );
}

ListHeader.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES).isRequired,
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
