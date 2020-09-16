import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import Title from '@misakey/ui/Typography/Title';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';

import BoxesSchema from 'store/schemas/Boxes';

// COMPONENTS
function BoxClosed({ isDrawerOpen, toggleDrawer, box, belongsToCurrentUser, t }) {
  const { title = '' } = useMemo(() => box, [box]);

  return (
    <>
      <AppBarDrawer
        isDrawerOpen={isDrawerOpen}
        toolbarProps={{ px: 0 }}
      >
        <Box display="flex" flexDirection="column" width="100%" minHeight="inherit">
          <Box display="flex">
            {!isDrawerOpen && (
              <Box display="flex" alignItems="center" pl={2} pr={1}>
                <IconButtonAppBar
                  aria-label={t('common:openAccountDrawer')}
                  edge="start"
                  onClick={toggleDrawer}
                >
                  <ArrowBack />
                </IconButtonAppBar>
              </Box>
            )}
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={belongsToCurrentUser} />
          </Box>
        </Box>
      </AppBarDrawer>
      <Box
        px={6}
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Title color="textSecondary" align="center">{t('boxes:read.noaccess.info', { title })}</Title>
      </Box>
    </>

  );
}

BoxClosed.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxClosed);
