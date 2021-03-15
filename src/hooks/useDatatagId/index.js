import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

// CONSTANTS
const DEFAULT_VALUE = ''; // no datatag by default

// HOOKS
export default (defaultValue = true) => {
  const { datatagId } = useLocationSearchParams();

  return useMemo(
    () => (isNil(datatagId) && defaultValue === true ? DEFAULT_VALUE : datatagId),
    [defaultValue, datatagId],
  );
};
