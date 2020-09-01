import React, { useMemo, useCallback } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { TMP_DRAWER_QUERY_PARAMS, SIDE_QUERY_PARAM, TEMP_DRAWER_MOBILE_WIDTH, TEMP_DRAWER_DESKTOP_WIDTH, SIDES } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrawerLayout from '@misakey/hooks/useDrawerLayout';

import ButtonSignOut from '@misakey/auth/components/Button/SignOut';
import CardIdentityThumbnail from 'components/dumb/Card/Identity/Thumbnail';
import AppBar from '@misakey/ui/AppBar';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import withIdentity from 'components/smart/withIdentity';
import Drawer from '@material-ui/core/Drawer';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Footer from 'components/dumb/Footer';
import DarkmodeSwitch from 'components/smart/Switch/Darkmode';

import ArrowBack from '@material-ui/icons/ArrowBack';

// CONSTANTS
const ACCOUNT = 'account';
const FOOTER_CONTAINER_PROPS = { mx: 2 };

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));

// COMPONENTS
const CardIdentityThumbnailWithIdentity = withIdentity(CardIdentityThumbnail);
function AccountDrawer({ t }) {
  const history = useHistory();
  const { pathname, search, hash } = useLocation();

  const { isSmDown, tmpDrawerSearch, side } = useDrawerLayout();

  const sideOrDefault = useMemo(
    () => side || SIDES.LEFT,
    [side],
  );

  const drawerWidth = useMemo(
    () => (isSmDown ? TEMP_DRAWER_MOBILE_WIDTH : TEMP_DRAWER_DESKTOP_WIDTH),
    [isSmDown],
  );
  const classes = useStyles({ drawerWidth });

  const isTmpDrawerOpen = useMemo(
    () => tmpDrawerSearch === ACCOUNT, [tmpDrawerSearch],
  );

  const hideDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, undefined],
      ])),
    }),
    [hash, pathname, search],
  );

  const exitedTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [SIDE_QUERY_PARAM, undefined],
      ])),
    }),
    [hash, pathname, search],
  );

  const onClose = useCallback(
    () => history.replace(hideDrawerTo),
    [hideDrawerTo, history],
  );

  const onExited = useCallback(
    () => history.replace(exitedTo),
    [exitedTo, history],
  );

  const SlideProps = useMemo(
    () => ({ onExited }),
    [onExited],
  );

  const onSignedOut = useCallback(() => history.replace(routes._), [history]);

  return (
    <Drawer
      variant="temporary"
      anchor={sideOrDefault}
      open={isTmpDrawerOpen}
      onClose={onClose}
      SlideProps={SlideProps}
      onExited={onExited}
      classes={{ paper: classes.drawerPaper }}
    >
      <>
        <AppBar position="static">
          <IconButtonAppBar
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={hideDrawerTo}
          >
            <ArrowBack />
          </IconButtonAppBar>
          <BoxFlexFill />
          <DarkmodeSwitch />
        </AppBar>
        <Box display="flex" flexDirection="column" alignItems="center">
          <CardIdentityThumbnailWithIdentity />
        </Box>
        <Divider />
        <Box mx={4} my={2}>
          <ButtonSignOut onSuccess={onSignedOut} />
        </Box>
        <Divider />
        <BoxFlexFill />
        <Footer containerProps={FOOTER_CONTAINER_PROPS} />
      </>
    </Drawer>
  );
}


AccountDrawer.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(AccountDrawer);
