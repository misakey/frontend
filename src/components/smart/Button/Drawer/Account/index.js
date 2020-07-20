import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Link, useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import getNextSearch from '@misakey/helpers/getNextSearch';

import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import { TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE } from 'constants/app/drawers';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));


function ButtonDrawerAccount({ t }) {
  const classes = useStyles();
  const { pathname, search } = useLocation();
  const openAccountDrawer = useMemo(
    () => ({
      pathname,
      search: getNextSearch(search, new Map([[TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ACCOUNT_VALUE]])),
    }),
    [pathname, search],
  );

  return (
    <IconButtonAppBar
      aria-label={t('common:openAccountDrawer')}
      component={Link}
      to={openAccountDrawer}
      edge="start"
    >
      <UserAccountAvatar classes={{ root: classes.avatar }} />
    </IconButtonAppBar>
  );
}

ButtonDrawerAccount.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common'])(ButtonDrawerAccount);
