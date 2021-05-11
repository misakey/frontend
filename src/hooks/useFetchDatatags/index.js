import { selectors as datatagSelectors, receiveDatatags } from 'store/reducers/datatag';

import { listDatatags } from '@misakey/core/api/helpers/builder/datatags';
import isNil from '@misakey/core/helpers/isNil';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const { getDatatags } = datatagSelectors;

// HOOKS
export default ({ isReady = true, forceRefresh = false } = {}) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const datatags = useSelector(getDatatags);

  const shouldFetch = useMemo(
    () => (isNil(datatags) || forceRefresh) && isReady,
    [datatags, forceRefresh, isReady],
  );

  const dispatchReceiveDatatags = useCallback(
    (response) => Promise.resolve(
      dispatch(receiveDatatags(response)),
    ),
    [dispatch],
  );

  const fetchDatatags = useCallback(
    () => listDatatags()
      .then(dispatchReceiveDatatags)
      .catch(handleHttpErrors),
    [dispatchReceiveDatatags, handleHttpErrors],
  );

  const fetchMetadata = useFetchEffect(
    fetchDatatags,
    { shouldFetch },
  );

  return useMemo(
    () => ({
      datatags,
      shouldFetch,
      ...fetchMetadata,
    }),
    [datatags, shouldFetch, fetchMetadata],
  );
};
