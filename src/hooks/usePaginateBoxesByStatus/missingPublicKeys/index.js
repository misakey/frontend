import { selectors } from 'store/reducers/userBoxes/pagination';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { makeGetBoxesPublicKeysSelector } from 'store/reducers/box';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import deleteSecrets from '@misakey/react/crypto/store/actions/deleteSecrets';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import difference from '@misakey/core/helpers/difference';
import omit from '@misakey/core/helpers/omit';

import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';


// CONSTANTS
const {
  getAsymKeys,
  getBoxKeyShares,
} = cryptoSelectors;
const { makeGetBySearchPagination, makeGetByPagination, makeGetItemCount } = selectors;
const { identity: IDENTITY_SELECTOR } = authSelectors;

// HOOKS
// @FIXME cannot be working if user has boxes in multiple organizations
export default (filterId, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  const asymKeys = useSelector(getAsymKeys);

  const dispatch = useDispatch();

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? makeGetBySearchPagination() : makeGetByPagination()),
    [hasSearch],
  );

  const getItemCountSelector = useMemo(
    () => makeGetItemCount(),
    [],
  );

  const paginatedPublicKeysSelector = useMemo(
    () => makeGetBoxesPublicKeysSelector(),
    [],
  );

  const identity = useSelector(IDENTITY_SELECTOR);

  // --- SELECTORS hook with memoization layer
  const byPagination = useSelector((state) => byPaginationSelector(state, filterId));

  const byPaginationIds = useMemo(
    () => Object.values(byPagination),
    [byPagination],
  );

  const byPaginationCount = useMemo(
    () => byPaginationIds.length,
    [byPaginationIds],
  );

  const itemCount = useSelector((state) => getItemCountSelector(state, filterId));

  const isPaginationFull = useMemo(
    () => byPaginationCount === itemCount,
    [byPaginationCount, itemCount],
  );

  const ids = useMemo(
    () => (isPaginationFull ? byPaginationIds : null),
    [isPaginationFull, byPaginationIds],
  );

  const paginatedPublicKeys = useSelector((state) => paginatedPublicKeysSelector(state, ids));

  const boxKeyShares = useSelector(getBoxKeyShares);
  const missingBoxKeyShares = useMemo(
    () => omit(boxKeyShares, ids),
    [boxKeyShares, ids],
  );
  // ---

  const missingPublicKeys = useMemo(
    () => {
      if (paginatedPublicKeys.length === 0) {
        return [];
      }
      const {
        pubkey: identityPublicKey,
        nonIdentifiedPubkey: identityNonIdentifiedPublicKey,
      } = identity;

      return difference(
        Object.keys(asymKeys),
        [
          ...paginatedPublicKeys,
          identityPublicKey,
          identityNonIdentifiedPublicKey,
        ],
      );
    },
    [asymKeys, paginatedPublicKeys, identity],
  );

  const emptyPaginatedPublicKeysCount = useMemo(
    () => paginatedPublicKeys.filter(isEmpty).length,
    [paginatedPublicKeys],
  );

  const clearMissingSecret = useCallback(
    async () => (
      dispatch(deleteSecrets({
        asymPublicKeys: missingPublicKeys,
        boxKeySharesBoxIds: Object.keys(missingBoxKeyShares),
      }))
    ),
    [dispatch, missingPublicKeys, missingBoxKeyShares],
  );

  return [missingPublicKeys, emptyPaginatedPublicKeysCount, clearMissingSecret];
};
