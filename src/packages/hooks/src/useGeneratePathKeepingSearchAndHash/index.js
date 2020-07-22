import { useMemo } from 'react';

import { useLocation, generatePath } from 'react-router-dom';


export default (path = '/', params = {}) => {
  const { search, hash } = useLocation();

  return useMemo(
    () => ({
      pathname: generatePath(path, params),
      search,
      hash,
    }),
    [hash, params, path, search],
  );
};
