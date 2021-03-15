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

import ListBordered from '@misakey/ui/List/Bordered';
import ListDatatags from 'components/smart/List/Datatags';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';

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
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  const nextSearch = useMemo(
    () => getNextSearch('', new Map([['orgId', selfOrgSelected ? undefined : orgId]])),
    [orgId, selfOrgSelected],
  );

  const boxesTo = useGeneratePathKeepingSearchAndHash(routes.boxes._, undefined, nextSearch, '');
  const tokenTo = useGeneratePathKeepingSearchAndHash(routes.organizations.secret, undefined, nextSearch, '');

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
    <>
      <ListBordered
        x={false}
        y={false}
        {...props}
      >
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
      </ListBordered>
      {!selfOrgSelected && <ListDatatags x={false} t {...props} />}
      {showTokenConfig && (
        <ListBordered t x={false} {...props}>
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
        </ListBordered>
      )}
    </>
  );
};

export default ListNavigationOrganization;
