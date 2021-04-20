import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import { useTranslation } from 'react-i18next';

import { Link } from 'react-router-dom';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ListNavigationOrganization from 'components/smart/List/Navigation/Organization';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// COMPONENTS
const DrawerOrganizationContent = ({ backTo, hideDrawerMap }) => {
  const { t } = useTranslation('common');

  return (
    <Box minHeight="100%" display="flex" flexDirection="column" overflow="hidden">
      <AppBarStatic>
        <IconButtonAppBar
          aria-label={t('common:goBack')}
          edge="start"
          component={Link}
          to={backTo}
        >
          <ArrowBackIcon />
        </IconButtonAppBar>
        <BoxFlexFill />
        <ListBordered
          dense
          disablePadding
        >
          <ListItemOrganizationCurrent />
        </ListBordered>
      </AppBarStatic>
      <Suspense fallback={<SplashScreen />}>
        <ListNavigationOrganization nextSearchMap={hideDrawerMap} />
      </Suspense>
    </Box>
  );
};
DrawerOrganizationContent.propTypes = {
  backTo: TO_PROP_TYPE.isRequired,
  hideDrawerMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

DrawerOrganizationContent.defaultProps = {
  hideDrawerMap: [],
};

export default DrawerOrganizationContent;
