import { actionCreators, selectors } from 'store/reducers/identity/organizations/agents/pagination';

import isNil from '@misakey/helpers/isNil';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';

import { addAgents } from 'store/reducers/identity/organizations/agents';

// ACTIONS
const { addPaginatedId } = actionCreators;
const { makeGetBySearchPagination, makeGetByPagination } = selectors;

// HOOKS
export const useOnAddAgents = (organizationId, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  // DISPATCH
  const dispatch = useDispatch();

  const dispatchAddAgents = useCallback(
    (agents) => batch(() => {
      dispatch(addAgents(agents, { organizationId }));
      agents.map(({ id }) => dispatch(addPaginatedId(organizationId, id, search)));
    }),
    [dispatch, search, organizationId],
  );

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? makeGetBySearchPagination() : makeGetByPagination()),
    [hasSearch],
  );
  // hook with memoization layer
  const byPagination = useSelector(byPaginationSelector);

  const byPaginationRef = useRef(byPagination);

  useEffect(
    () => {
      byPaginationRef.current = byPagination;
    },
    [byPaginationRef, byPagination],
  );

  return useCallback(
    (agents) => dispatchAddAgents(agents),
    [dispatchAddAgents],
  );
};
