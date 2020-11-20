import { selectors } from 'store/reducers/userBoxes/pagination';
import { makeGetBoxesPublicKeysSelector } from 'store/reducers/box';
import removeBoxSecretKeysAndKeyShares from '@misakey/crypto/store/actions/removeBoxSecretKeysAndKeyShares';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import difference from '@misakey/helpers/difference';

import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

import { ALL } from 'constants/app/boxes/statuses';

// CONSTANTS
const { makeGetMissingBoxKeyShares } = cryptoSelectors;
const { getBySearchPagination, getByPagination, getItemCount } = selectors;

// HOOKS
export default (status = ALL, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();

  const dispatch = useDispatch();

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? getBySearchPagination : getByPagination),
    [hasSearch],
  );

  const paginatedPublicKeysSelector = useMemo(
    () => makeGetBoxesPublicKeysSelector(),
    [],
  );

  const missingBoxKeySharesSelector = useMemo(
    () => makeGetMissingBoxKeyShares(),
    [],
  );

  // --- SELECTORS hook with memoization layer
  const byPagination = useSelector((state) => byPaginationSelector(state, status));

  const byPaginationIds = useMemo(
    () => Object.values(byPagination),
    [byPagination],
  );

  const byPaginationCount = useMemo(
    () => byPaginationIds.length,
    [byPaginationIds],
  );

  const itemCount = useSelector((state) => getItemCount(state, status));

  const isPaginationFull = useMemo(
    () => byPaginationCount === itemCount,
    [byPaginationCount, itemCount],
  );

  const ids = useMemo(
    () => (isPaginationFull ? byPaginationIds : null),
    [isPaginationFull, byPaginationIds],
  );

  const paginatedPublicKeys = useSelector((state) => paginatedPublicKeysSelector(state, ids));

  const missingBoxKeyShares = useSelector((state) => missingBoxKeySharesSelector(state, ids));
  // ---

  const missingPublicKeys = useMemo(
    () => {
      if (paginatedPublicKeys.length === 0) {
        return [];
      }
      return difference([...publicKeysWeCanDecryptFrom.keys()], paginatedPublicKeys);
    },
    [publicKeysWeCanDecryptFrom, paginatedPublicKeys],
  );

  const emptyPaginatedPublicKeysCount = useMemo(
    () => paginatedPublicKeys.filter(isEmpty).length,
    [paginatedPublicKeys],
  );

  const missingSecrets = useMemo(
    () => [...publicKeysWeCanDecryptFrom.entries()].reduce((acc, [publicKey, secretKey]) => {
      if (missingPublicKeys.includes(publicKey)) {
        acc.push(secretKey);
      }
      return acc;
    }, []),
    [publicKeysWeCanDecryptFrom, missingPublicKeys],
  );

  const clearMissingSecret = useCallback(
    () => Promise.resolve(
      dispatch(removeBoxSecretKeysAndKeyShares(
        {
          secretKeys: missingSecrets,
          boxIds: Object.keys(missingBoxKeyShares),
        },
      )),
    ),
    [dispatch, missingSecrets, missingBoxKeyShares],
  );

  return [missingPublicKeys, emptyPaginatedPublicKeysCount, clearMissingSecret];
};
