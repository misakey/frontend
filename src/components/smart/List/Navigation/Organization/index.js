import React, { useMemo } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withDialogPassword from 'components/smart/Dialog/Password/with';

import ChatIcon from '@material-ui/icons/Chat';
import SaveIcon from '@material-ui/icons/Save';

// COMPONENTS
const LinkWithDialogPassword = withDialogPassword(Link);

const ListNavigationOrganization = (props) => {
  const routeBoxesMatch = useRouteMatch(routes.boxes._);
  const isRouteBoxes = useMemo(
    () => !isNil(routeBoxesMatch),
    [routeBoxesMatch],
  );

  const boxesTo = useGeneratePathKeepingSearchAndHash(routes.boxes._, undefined, undefined, '');

  const routeDocumentsMatch = useRouteMatch(routes.documents._);
  const isRouteDocuments = useMemo(
    () => !isNil(routeDocumentsMatch),
    [routeDocumentsMatch],
  );

  const { t } = useTranslation(['boxes', 'document']);

  return (
    <List {...props}>
      <ListItem
        selected={isRouteBoxes}
        button
        component={LinkWithDialogPassword}
        to={boxesTo}
      >
        <ListItemIcon>
          <ChatIcon />
        </ListItemIcon>
        <ListItemText>{t('boxes:documentTitle')}</ListItemText>
      </ListItem>
      <ListItem
        selected={isRouteDocuments}
        button
        component={LinkWithDialogPassword}
        to={routes.documents._}
      >
        <ListItemIcon>
          <SaveIcon />
        </ListItemIcon>
        <ListItemText>{t('document:vault.title')}</ListItemText>
      </ListItem>
    </List>
  );
};

export default ListNavigationOrganization;
