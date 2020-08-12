import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

function DocumentNone({ drawerWidth, isDrawerOpen, toggleDrawer, t }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: 'inherit' }}
    >
      <AppBarDrawer drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
        {!isDrawerOpen && (
          <IconButtonAppBar
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButtonAppBar>
        )}
      </AppBarDrawer>

      <Typography>{t('document:read.none')}</Typography>
      {!isDrawerOpen && (
        <Button text={t('common:select')} onClick={toggleDrawer} standing={BUTTON_STANDINGS.MAIN} />
      )}
    </Box>

  );
}

DocumentNone.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('document')(DocumentNone);
