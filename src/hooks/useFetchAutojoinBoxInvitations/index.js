import { BOX_AUTO_INVITE } from 'constants/app/notifications/byIdentity';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { getUserNotificationsBuilder } from '@misakey/core/api/helpers/builder/identities';
import isNil from '@misakey/core/helpers/isNil';

import { useMemo, useCallback, useReducer } from 'react';
import { useSelector } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useAutojoinBoxInvitations from 'hooks/useAutojoinBoxInvitations';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// CONSTANTS
const {
  identityId: IDENTITY_ID_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

const QUERY_PARAMS = {
  type: BOX_AUTO_INVITE,
  used: false,
  offset: 0,
  limit: 0,
};

const INITIAL_STATE = {
  done: false,
  joining: null,
};

const DONE = Symbol('DONE');
const JOINING = Symbol('JOINING');
const RESET = Symbol('RESET');

// HELPERS
const autojoinReducer = (state, { type, count }) => {
  if (type === JOINING) {
    return {
      ...state,
      joining: count,
    };
  }
  if (type === DONE) {
    return {
      ...state,
      done: true,
      joining: INITIAL_STATE.joining,
    };
  }
  if (type === RESET) {
    return INITIAL_STATE;
  }
  return state;
};

// HOOKS
export default () => {
  const [state, dispatch] = useReducer(autojoinReducer, INITIAL_STATE);
  const { done } = useSafeDestr(state);

  const identityId = useSelector(IDENTITY_ID_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const onJoining = useCallback(
    (ids) => dispatch({ type: JOINING, count: ids.length }),
    [],
  );

  const autojoinBoxInvitations = useAutojoinBoxInvitations(identityId, onJoining);

  const shouldFetch = useMemo(
    () => isAuthenticated && !isNil(identityId) && done === false,
    [isAuthenticated, identityId, done],
  );

  const onReset = useCallback(
    () => {
      dispatch({ type: RESET });
    },
    [],
  );

  const joinNotifications = useCallback(
    async () => {
      onReset();
      const boxInvitations = await getUserNotificationsBuilder(identityId, QUERY_PARAMS);
      return autojoinBoxInvitations(boxInvitations);
    },
    [onReset, identityId, autojoinBoxInvitations],
  );

  const onSuccess = useCallback(
    () => {
      dispatch({ type: DONE });
    },
    [dispatch],
  );

  useFetchEffect(
    joinNotifications,
    { shouldFetch },
    { onSuccess },
  );

  return useMemo(
    () => state,
    [state],
  );
};
