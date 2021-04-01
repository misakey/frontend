import isNil from '@misakey/core/helpers/isNil';

import { useCallback, useRef, useEffect } from 'react';
import { useLocation, generatePath } from 'react-router-dom';

// HOOKS
export default () => {
  const { search, hash } = useLocation();

  const searchRef = useRef(search);
  const hashRef = useRef(hash);

  useEffect(
    () => {
      searchRef.current = search;
    },
    [search, searchRef],
  );

  useEffect(
    () => {
      hashRef.current = hash;
    },
    [hash, hashRef],
  );

  return useCallback(
    (path = '/', params = {}, overrideSearch = null, overrideHash = null) => ({
      pathname: generatePath(path, params),
      search: isNil(overrideSearch) ? searchRef.current : overrideSearch,
      hash: isNil(overrideHash) ? hashRef.current : overrideHash,
    }),
    [hashRef, searchRef],
  );
};
