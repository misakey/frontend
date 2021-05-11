import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';
import routes from 'routes';

import getNextSearch from '@misakey/core/helpers/getNextSearch';

import { useTranslation } from 'react-i18next';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ListBordered from '@misakey/ui/List/Bordered';
import LinkWithDialogPassword from '@misakey/react/auth/components/Dialog/Password/with/Link';
import ListItemNavLink from '@misakey/ui/ListItem/NavLink';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ChatIcon from '@material-ui/icons/Chat';
import SaveIcon from '@material-ui/icons/Save';

// COMPONENTS
const DrawerBoxesContent = ({ backTo, hideDrawerMap }) => {
  const { t } = useTranslation(['common', 'boxes']);
  const { search } = useLocation();

  const nextSearch = useMemo(
    () => getNextSearch(search, new Map(hideDrawerMap)),
    [hideDrawerMap, search],
  );

  const boxesTo = useGeneratePathKeepingSearchAndHash(routes.boxes._, undefined, nextSearch, '');

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
      </AppBarStatic>
      <ListBordered
        x={false}
        y={false}
      >
        <ListItemNavLink
          path={routes.boxes._}
          button
          component={LinkWithDialogPassword}
          to={boxesTo}
        >
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText>{t('boxes:drawer.boxes')}</ListItemText>
        </ListItemNavLink>
        <ListItemNavLink
          path={routes.documents._}
          button
          component={LinkWithDialogPassword}
          to={routes.documents._}
        >
          <ListItemIcon>
            <SaveIcon />
          </ListItemIcon>
          <ListItemText>{t('boxes:drawer.documents')}</ListItemText>
        </ListItemNavLink>
      </ListBordered>
    </Box>
  );
};
DrawerBoxesContent.propTypes = {
  backTo: TO_PROP_TYPE.isRequired,
  hideDrawerMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

DrawerBoxesContent.defaultProps = {
  hideDrawerMap: [],
};

export default DrawerBoxesContent;
