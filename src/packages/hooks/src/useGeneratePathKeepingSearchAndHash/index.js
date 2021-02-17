import isNil from '@misakey/helpers/isNil';

import { useMemo, useEffect, useRef } from 'react';
import { useLocation, generatePath } from 'react-router-dom';


export default (path = '/', params = {}, overrideSearch = null, overrideHash = null) => {
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

  return useMemo(
    () => ({
      pathname: generatePath(path, params),
      search: isNil(overrideSearch) ? searchRef.current : overrideSearch,
      hash: isNil(overrideHash) ? hashRef.current : overrideHash,
    }),
    [hashRef, overrideHash, overrideSearch, params, path, searchRef],
  );
};
