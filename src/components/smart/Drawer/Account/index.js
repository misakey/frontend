import React, { useMemo, useCallback } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useHistory, useLocation, Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import getNextSearch from '@misakey/helpers/getNextSearch';
import getSearchParams from '@misakey/helpers/getSearchParams';

import ButtonSignOut from '@misakey/auth/components/Button/SignOut';
import CardIdentityThumbnail from 'components/dumb/Card/Identity/Thumbnail';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import withIdentity from 'components/smart/withIdentity';

import Drawer from '@material-ui/core/Drawer';
import { TMP_DRAWER_QUERY_PARAMS, TEMP_DRAWER_MOBILE_WIDTH, TEMP_DRAWER_DESKTOP_WIDTH } from 'constants/app/drawers';
import { useMediaQuery } from '@material-ui/core';

// COMPONENTS
const CardIdentityThumbnailWithIdentity = withIdentity(CardIdentityThumbnail);

// CONSTANTS
const ACCOUNT = 'account';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));


function AccountDrawer({ t }) {
  const history = useHistory();
  const { pathname, search, hash } = useLocation();
  const searchParams = getSearchParams(search);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const drawerWidth = useMemo(
    () => (isSmDown ? TEMP_DRAWER_MOBILE_WIDTH : TEMP_DRAWER_DESKTOP_WIDTH),
    [isSmDown],
  );
  const classes = useStyles({ drawerWidth });

  const isTmpDrawerOpen = useMemo(
    () => searchParams[TMP_DRAWER_QUERY_PARAMS] === ACCOUNT, [searchParams],
  );

  const hideDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([[TMP_DRAWER_QUERY_PARAMS, undefined]])),
    }),
    [hash, pathname, search],
  );

  const onClose = useCallback(
    () => history.replace(hideDrawerTo),
    [hideDrawerTo, history],
  );

  const onSignedOut = useCallback(() => history.replace(routes._), [history]);

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={isTmpDrawerOpen}
      onClose={onClose}
      classes={{ paper: classes.drawerPaper }}
    >
      <>
        <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
          <IconButtonAppBar
            color="inherit"
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={hideDrawerTo}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarDrawer>
        <Box display="flex" flexDirection="column" alignItems="center">
          <CardIdentityThumbnailWithIdentity />
        </Box>
        <Divider />
        <Box mx={4} my={2}>
          <ButtonSignOut onSuccess={onSignedOut} />
        </Box>
        <Divider />
      </>
    </Drawer>
  );
}


AccountDrawer.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(AccountDrawer);
