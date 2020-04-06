import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import getSearchParams from '@misakey/helpers/getSearchParams';
import isFunction from '@misakey/helpers/isFunction';

export default (transform = null) => {
  const { search: locationSearch } = useLocation();

  const searchParams = useMemo(
    () => getSearchParams(locationSearch),
    [locationSearch],
  );

  return useMemo(
    () => (isFunction(transform)
      ? transform(searchParams)
      : searchParams),
    [searchParams, transform],
  );
};
