import { useMemo } from 'react';

import { ROLE_LABELS } from 'constants/Roles';

import { useLocation } from 'react-router-dom';

import propOr from '@misakey/helpers/propOr';

// CONSTANTS
const ROLE_REGEX = new RegExp(`^/(${Object.values(ROLE_LABELS).join('|')})`);
const DEFAULT_ROLE = ROLE_LABELS.CITIZEN;

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
