import { useMemo } from 'react';

import { WORKSPACES, WORKSPACE } from 'constants/workspaces';

import { useLocation } from 'react-router-dom';

import propOr from '@misakey/helpers/propOr';

// CONSTANTS
const ROLE_REGEX = new RegExp(`^/(${WORKSPACES.join('|')})`);
const DEFAULT_ROLE = WORKSPACE.CITIZEN;

export default (noDefaultRole = false) => {
  const { pathname } = useLocation();

  const defaultRole = useMemo(
    () => (noDefaultRole ? null : DEFAULT_ROLE),
    [noDefaultRole],
  );

  const locationRole = useMemo(
    () => propOr(defaultRole, '1', ROLE_REGEX.exec(pathname)),
    [defaultRole, pathname],
  );

  return locationRole;
};
