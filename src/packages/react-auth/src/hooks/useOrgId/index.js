import isNil from '@misakey/core/helpers/isNil';

import { useMemo } from 'react';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

export default (defaultValue = true) => {
  const { orgId } = useLocationSearchParams();

  return useMemo(
    () => (isNil(orgId) && defaultValue === true ? window.env.SELF_CLIENT_ID : orgId),
    [defaultValue, orgId],
  );
};
