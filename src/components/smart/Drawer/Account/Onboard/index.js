import React from 'react';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';

import { useTranslation } from 'react-i18next';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Footer from '@misakey/ui/Footer';
import CardOnboard from 'components/dumb/Card/Onboard';
import ButtonConnect from 'components/dumb/Button/Connect';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Divider from '@material-ui/core/Divider';

import ArrowBack from '@material-ui/icons/ArrowBack';

// CONSTANTS
const FOOTER_CONTAINER_PROPS = { mx: 2 };

// COMPONENTS
const BoxAccountOnboard = ({ toggleDrawer }) => {
  const { t } = useTranslation('common');

  return (
    <Box minHeight="100%" display="flex" flexDirection="column">
      <AppBarStatic>
        <IconButtonAppBar
          aria-label={t('common:goBack')}
          edge="start"
          onClick={toggleDrawer}
        >
          <ArrowBack />
        </IconButtonAppBar>
        <BoxFlexFill />
      </AppBarStatic>
      <Box display="flex" flexDirection="column" alignItems="center" flexShrink="0">
        <CardOnboard />
      </Box>
      <Divider />
      <Box display="flex" flexDirection="column" flexShrink="0" mx={4} my={2}>
        <ButtonConnect
          standing={BUTTON_STANDINGS.TEXT}
        />
      </Box>
      <Divider />
      <BoxFlexFill />
      <Footer containerProps={FOOTER_CONTAINER_PROPS} />
    </Box>
  );
};

BoxAccountOnboard.propTypes = {
  ...DRAWER_PROPS_PROP_TYPES,
};

export default BoxAccountOnboard;
