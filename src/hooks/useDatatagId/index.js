import isNil from '@misakey/core/helpers/isNil';

import { useMemo } from 'react';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

// CONSTANTS
const DEFAULT_VALUE = undefined; // no datatag filtering by default

// HOOKS
export default (defaultValue = true) => {
  const { datatagId } = useLocationSearchParams();

  return useMemo(
    () => (isNil(datatagId) && defaultValue === true ? DEFAULT_VALUE : datatagId),
    [defaultValue, datatagId],
  );
};
