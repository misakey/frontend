import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import routes from 'routes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';

import getNextSearch from '@misakey/core/helpers/getNextSearch';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListBordered from '@misakey/ui/List/Bordered';
import ListItemNavLink from '@misakey/ui/ListItem/NavLink';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import HomeIcon from '@material-ui/icons/Home';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import GroupIcon from '@material-ui/icons/Group';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const ListNavigationOrganization = ({ nextSearchMap, ...props }) => {
  const { search } = useLocation();

  const orgId = useOrgId();

  const nextSearch = useMemo(
    () => getNextSearch(search, new Map([
      ['orgId', orgId],
      ...nextSearchMap,
    ])),
    [nextSearchMap, orgId, search],
  );

  const homeTo = useGeneratePathKeepingSearchAndHash(routes.organizations._, undefined, nextSearch, '');
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
    () => currentIdentityRole === ADMIN,
    [currentIdentityRole],
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
          path={routes.organizations._}
          button
          component={Link}
          to={homeTo}
          exact
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>{t('organizations:home.title')}</ListItemText>
        </ListItemNavLink>
      </ListBordered>
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

ListNavigationOrganization.propTypes = {
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};
ListNavigationOrganization.defaultProps = {
  nextSearchMap: [],
};

export default ListNavigationOrganization;
