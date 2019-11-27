import { useMemo } from 'react';

import isNil from '@misakey/helpers/isNil';
import some from '@misakey/helpers/some';

export default (userRoles, requiredScope) => useMemo(() => {
  if (isNil(userRoles)) { return false; }
  return some(
    userRoles,
    ({ roleLabel, applicationId, valid }) => (`rol.${roleLabel}.${applicationId}` === requiredScope && valid),
  );
}, [requiredScope, userRoles]);
