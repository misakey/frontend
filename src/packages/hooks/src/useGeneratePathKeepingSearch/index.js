import { useMemo } from 'react';

import { useLocation, generatePath } from 'react-router-dom';


export default (path = '/', params = {}) => {
  const { search } = useLocation();

  return useMemo(
    () => ({
      pathname: generatePath(path, params),
      search,
    }),
    [params, path, search],
  );
};
