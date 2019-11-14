import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import getSearchParams from '@misakey/helpers/getSearchParams';

export default () => {
  const { search: locationSearch } = useLocation();

  const searchParams = useMemo(
    () => getSearchParams(locationSearch),
    [locationSearch],
  );

  return searchParams;
};
