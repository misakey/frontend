import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SET_ALL_REQUEST_IDS_FOR_STATUS,
  ADD_TO_ALL_REQUEST_IDS_FOR_STATUS,
  REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS,
} from 'store/actions/screens/allRequestIds';
import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';
import get from '@misakey/helpers/get';
import { createSelector } from 'reselect';

// @FIXME: this could be refactored inside entities store to follow the `byIds` pattern
// from https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#designing-a-normalized-state
// as soon as we need this kind of pattern again
const initialState = {};

function setAllRequestIdsForStatus(state, { ids, status }) {
  return { ...state, [status]: ids };
}

function addToAllRequestIdsForStatus(state, { id, status, head }) {
  const currentStateForStatus = get(state, status, []);
  const newStateForStatus = head ? [id, ...currentStateForStatus] : [...currentStateForStatus, id];
  return {
    ...state,
    [status]: newStateForStatus,
  };
}

function removeFromAllRequestIdsForStatus(state, { id, status }) {
  const currentStateForStatus = get(state, status, []);
  const newStateForStatus = currentStateForStatus.filter((element) => element !== id);
  return {
    ...state,
    [status]: newStateForStatus,
  };
}

export default createReducer(initialState, {
  [SET_ALL_REQUEST_IDS_FOR_STATUS]: setAllRequestIdsForStatus,
  [ADD_TO_ALL_REQUEST_IDS_FOR_STATUS]: addToAllRequestIdsForStatus,
  [REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS]: removeFromAllRequestIdsForStatus,
});

const allRequestIdsSelector = (state) => state.screens.allRequestIds;

export const requestsByStatusNotEmptySelector = createSelector(
  allRequestIdsSelector,
  (normalizedRequestIdsByStatus) => any(
    (requestIdsByStatus) => !isEmpty(requestIdsByStatus),
    Object.values(normalizedRequestIdsByStatus),
  ),
);
