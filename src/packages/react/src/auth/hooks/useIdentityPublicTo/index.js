import authRoutes from '@misakey/react/auth/routes';

import isNil from '@misakey/core/helpers/isNil';
import { generatePath } from 'react-router-dom';

import { useMemo } from 'react';

// HOOKS
export default (id) => useMemo(
  () => (isNil(id)
    ? null
    : generatePath(authRoutes.identities.public, { id })),
  [id],
);
