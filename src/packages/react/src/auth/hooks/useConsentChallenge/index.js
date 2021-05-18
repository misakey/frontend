import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';

import { useMemo } from 'react';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

// CONSTANTS

export default () => {
  const { consentChallenge } = useLocationSearchParams(objectToCamelCase);

  return useMemo(
    () => consentChallenge,
    [consentChallenge],
  );
};
