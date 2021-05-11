import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import routes from 'routes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';


import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';

import ButtonShortcut from '@misakey/ui/Button/Shortcut';
import Box from '@material-ui/core/Box';

import VpnKeyIcon from '@material-ui/icons/VpnKey';
import GroupIcon from '@material-ui/icons/Group';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

// COMPONENTS
const OrganizationListShortcuts = (props) => {
  const { t } = useTranslation('organizations');

  const tokenTo = useGeneratePathKeepingSearchAndHash(routes.organizations.secret, undefined, undefined, '');
  const agentsTo = useGeneratePathKeepingSearchAndHash(routes.organizations.agents, undefined, undefined, '');

  const orgId = useOrgId();

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

  if (!showAdminConfig) {
    return null;
  }

  return (
    <Box {...props}>
      <ButtonShortcut
        component={Link}
        to={tokenTo}
        label={t('organizations:secret.title')}
      >
        <VpnKeyIcon />
      </ButtonShortcut>
      <ButtonShortcut
        component={Link}
        to={agentsTo}
        label={t('organizations:agents.title')}
      >
        <GroupIcon />
      </ButtonShortcut>
    </Box>
  );
};

export default OrganizationListShortcuts;
