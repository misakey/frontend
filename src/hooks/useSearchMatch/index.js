import { useMemo } from 'react';

import isArray from '@misakey/core/helpers/isArray';
import { hasAllKeys, hasAllKeysAndValues } from 'helpers/searchRouting';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

// HOOKS
export default (searchParams) => {
  const locationSearchParams = useLocationSearchParams();

  const match = useMemo(
    () => (isArray(searchParams)
      ? hasAllKeys(searchParams, locationSearchParams)
      : hasAllKeysAndValues(searchParams, locationSearchParams)),
    [searchParams, locationSearchParams],
  );

  return match;
};
