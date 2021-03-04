import React, { useMemo } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import routes from 'routes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';

import isNil from '@misakey/helpers/isNil';
import isSelfOrg from 'helpers/isSelfOrg';
import getNextSearch from '@misakey/helpers/getNextSearch';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useOrgId from 'hooks/useOrgId';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import withDialogPassword from 'components/smart/Dialog/Password/with';

import ChatIcon from '@material-ui/icons/Chat';
import SaveIcon from '@material-ui/icons/Save';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const LinkWithDialogPassword = withDialogPassword(Link);

const ListNavigationOrganization = (props) => {
  const routeBoxesMatch = useRouteMatch(routes.boxes._);
  const isRouteBoxes = useMemo(
    () => !isNil(routeBoxesMatch),
    [routeBoxesMatch],
  );

  const orgId = useOrgId();

  const nextSearch = useMemo(
    () => getNextSearch('', new Map([['orgId', orgId]])),
    [orgId],
  );

  const boxesTo = useGeneratePathKeepingSearchAndHash(routes.boxes._, undefined, nextSearch, '');
  const tokenTo = useGeneratePathKeepingSearchAndHash(routes.organizations.secret, undefined, nextSearch, '');

  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  // SELECTOR
  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));

  const { currentIdentityRole } = useSafeDestr(organization);

  const showTokenConfig = useMemo(
    () => !selfOrgSelected && currentIdentityRole === ADMIN,
    [selfOrgSelected, currentIdentityRole],
  );
  const routeTokenMatch = useRouteMatch(routes.organizations.secret);
  const isRouteToken = useMemo(
    () => !isNil(routeTokenMatch),
    [routeTokenMatch],
  );

  const routeDocumentsMatch = useRouteMatch(routes.documents._);
  const isRouteDocuments = useMemo(
    () => !isNil(routeDocumentsMatch),
    [routeDocumentsMatch],
  );

  const { t } = useTranslation(['boxes', 'document', 'organizations']);

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
      {selfOrgSelected && (
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
      )}
      <Divider />
      {showTokenConfig && (
        <ListItem
          selected={isRouteToken}
          button
          component={Link}
          to={tokenTo}
        >
          <ListItemIcon>
            <SettingsInputComponentIcon />
          </ListItemIcon>
          <ListItemText>{t('organizations:secret.title')}</ListItemText>
        </ListItem>
      )}
    </List>
  );
};

export default ListNavigationOrganization;
