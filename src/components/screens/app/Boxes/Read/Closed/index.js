import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import Title from '@misakey/ui/Typography/Title';
import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';

import BoxesSchema from 'store/schemas/Boxes';
import { DATE_FULL } from 'constants/formats/dates';

// COMPONENTS
function BoxClosed({ drawerWidth, isDrawerOpen, toggleDrawer, box, belongsToCurrentUser, t }) {
  const { title = '', lastEvent } = useMemo(() => box, [box]);
  const { sender: { displayName }, serverEventCreatedAt } = useMemo(() => lastEvent, [lastEvent]);
  const date = useMemo(
    () => moment(serverEventCreatedAt).format(DATE_FULL), [serverEventCreatedAt],
  );

  return (
    <>
      <AppBarDrawer
        drawerWidth={drawerWidth}
        isDrawerOpen={isDrawerOpen}
        toolbarProps={{ px: 0 }}
      >
        {!isDrawerOpen && (
        <IconButtonAppBar
          color="inherit"
          aria-label={t('common:openAccountDrawer')}
          edge="start"
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButtonAppBar>
        )}
        <BoxEventsAppBar disabled box={box} belongsToCurrentUser={belongsToCurrentUser} />
      </AppBarDrawer>
      <Box
        px={6}
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Title color="textSecondary" align="center">{t('boxes:read.closed.info', { title, displayName, date })}</Title>
      </Box>
    </>

  );
}

BoxClosed.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxClosed);
