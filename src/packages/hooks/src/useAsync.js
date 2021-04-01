import { useState, useMemo, useEffect } from 'react';

import isFunction from '@misakey/core/helpers/isFunction';

// HELPERS
const callAsync = (arg) => (isFunction(arg) ? Promise.resolve(arg()) : Promise.resolve(arg));

const getFetchData = (setData) => async (fetcher) => {
  const result = await callAsync(fetcher);
  setData(result);
};

// HOOKS
const useFetchData = (setData) => useMemo(() => getFetchData(setData), [setData]);

const useAsyncData = (arg, fetchData, effects) => useEffect(() => {
  fetchData(arg);
}, [arg, fetchData, ...effects]); // eslint-disable-line react-hooks/exhaustive-deps

export default (arg, ...effects) => {
  const [data, setData] = useState();

  const fetchData = useFetchData(setData);

  useAsyncData(arg, fetchData, effects);

  return data;
};
