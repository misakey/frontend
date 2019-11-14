import { useMemo } from 'react';

import { ROLE_LABELS } from 'constants/Roles';

import { useLocation } from 'react-router-dom';

import propOr from '@misakey/helpers/propOr';

// CONSTANTS
const ROLE_REGEX = new RegExp(`^/(${Object.values(ROLE_LABELS).join('|')})`);
const DEFAULT_ROLE = ROLE_LABELS.CITIZEN;

export default () => {
  const { pathname } = useLocation();

  const locationRole = useMemo(
    () => propOr(DEFAULT_ROLE, '1', ROLE_REGEX.exec(pathname)),
    [pathname],
  );

  return locationRole;
};
