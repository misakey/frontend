import React from 'react';
import PropTypes from 'prop-types';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';
import { withTranslation } from 'react-i18next';


function BoxNone({ drawerWidth, isDrawerOpen, toggleDrawer, t }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: 'inherit' }}
    >
      <AppBarDrawer drawerWidth={drawerWidth}>
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
      </AppBarDrawer>

      <Title align="center">{t('boxes:list.select')}</Title>
      {!isDrawerOpen && (
        <Button text={t('common:select')} onClick={toggleDrawer} standing={BUTTON_STANDINGS.MAIN} />
      )}
    </Box>

  );
}

BoxNone.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxNone);
