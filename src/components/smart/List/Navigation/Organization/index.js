import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import routes from 'routes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';

import isSelfOrg from 'helpers/isSelfOrg';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useOrgId from '@misakey/react-auth/hooks/useOrgId';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListBordered from '@misakey/ui/List/Bordered';
import ListDatatags from 'components/smart/List/Datatags';
import ListItemNavLink from '@misakey/ui/ListItem/NavLink';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';

import ChatIcon from '@material-ui/icons/Chat';
import SaveIcon from '@material-ui/icons/Save';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import GroupIcon from '@material-ui/icons/Group';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const LinkWithDialogPassword = withDialogPassword(Link);

const ListNavigationOrganization = (props) => {
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
  const agentsTo = useGeneratePathKeepingSearchAndHash(routes.organizations.agents, undefined, nextSearch, '');

  // SELECTOR
  const denormalizeOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  const organization = useSelector((state) => denormalizeOrganizationSelector(state, orgId));

  const { currentIdentityRole } = useSafeDestr(organization);

  const showAdminConfig = useMemo(
    () => !selfOrgSelected && currentIdentityRole === ADMIN,
    [selfOrgSelected, currentIdentityRole],
  );

  const { t } = useTranslation('organizations');

  return (
    <>
      <ListBordered
        x={false}
        y={false}
        {...props}
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
          <ListItemText>{t('organizations:navigation.boxes')}</ListItemText>
        </ListItemNavLink>
        {selfOrgSelected && (
          <ListItemNavLink
            path={routes.documents._}
            button
            component={LinkWithDialogPassword}
            to={routes.documents._}
          >
            <ListItemIcon>
              <SaveIcon />
            </ListItemIcon>
            <ListItemText>{t('organizations:navigation.documents')}</ListItemText>
          </ListItemNavLink>
        )}
      </ListBordered>
      {!selfOrgSelected && <ListDatatags x={false} t {...props} />}
      {showAdminConfig && (
        <ListBordered t x={false} {...props}>
          <ListItemNavLink
            path={routes.organizations.secret}
            button
            component={Link}
            to={tokenTo}
          >
            <ListItemIcon>
              <VpnKeyIcon />
            </ListItemIcon>
            <ListItemText>{t('organizations:secret.title')}</ListItemText>
          </ListItemNavLink>
          <ListItemNavLink
            path={routes.organizations.agents}
            button
            component={Link}
            to={agentsTo}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText>{t('organizations:agents.title')}</ListItemText>
          </ListItemNavLink>
        </ListBordered>
      )}
    </>
  );
};

export default ListNavigationOrganization;
