import { STORAGE_PREFIX } from '@misakey/auth/constants';

import getSearchParams from '@misakey/helpers/getSearchParams';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import storage from '@misakey/helpers/storage';
import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const EMPTY_OBJ = {};

// HOOKS
export default () => {
  const { hash } = useLocation();

  const search = useMemo(
    () => (hash.indexOf('#') === 0 ? hash.replace('#', '?') : hash),
    [hash],
  );

  const searchParams = useMemo(
    () => objectToCamelCase(getSearchParams(search)),
    [search],
  );

  const { state } = useSafeDestr(searchParams);

  const storageParams = useMemo(
    () => {
      if (isNil(state)) {
        return EMPTY_OBJ;
      }
      const storageItem = storage.getItem(`${STORAGE_PREFIX}${state}`);
      if (isNil(storageItem)) {
        return EMPTY_OBJ;
      }
      return objectToCamelCase(JSON.parse(storageItem));
    },
    [state],
  );

  return useMemo(
    () => ({ searchParams, storageParams }),
    [searchParams, storageParams],
  );
};
