import { useMemo } from 'react';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

import isNil from '@misakey/helpers/isNil';
import some from '@misakey/helpers/some';

export default (userRoles, requiredScope) => useMemo(() => {
  if (isNil(userRoles)) { return false; }
  return some(
    userRoles,
    ({ roleLabel, applicationId, valid }) => (`${ROLE_PREFIX_SCOPE}.${roleLabel}.${applicationId}` === requiredScope && valid),
  );
}, [requiredScope, userRoles]);
