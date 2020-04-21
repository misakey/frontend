import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SET_ALL_REQUEST_IDS_FOR_STATUS,
  UPDATE_ALL_REQUEST_IDS_FOR_STATUS,
  REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS,
} from 'store/actions/screens/allRequestIds';
import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import mapValues from '@misakey/helpers/mapValues';
import propOr from '@misakey/helpers/propOr';
import { createSelector } from 'reselect';

// @FIXME: this could be refactored inside entities store to follow the `byIds` pattern
// from https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#designing-a-normalized-state
// as soon as we need this kind of pattern again
const initialState = {};

function setAllRequestIdsForStatus(state, { ids, status }) {
  return { ...state, [status]: ids };
}

function updateAllRequestIdsForStatus(state, { id, status, head }) {
  const newState = isNil(state[status]) ? { ...state, [status]: [] } : { ...state };
  return mapValues(newState, (value, key) => {
    // add to new status list
    if (key === status) {
      return head ? [id, ...value] : [...value, id];
    }
    // remove from old status list
    if (value.includes(id)) {
      return value.filter((element) => element !== id);
    }
    return value;
  });
}

function removeFromAllRequestIdsForStatus(state, { id, status }) {
  const currentStateForStatus = propOr([], status)(state);
  const newStateForStatus = currentStateForStatus.filter((element) => element !== id);
  return {
    ...state,
    [status]: newStateForStatus,
  };
}

export default createReducer(initialState, {
  [SET_ALL_REQUEST_IDS_FOR_STATUS]: setAllRequestIdsForStatus,
  [UPDATE_ALL_REQUEST_IDS_FOR_STATUS]: updateAllRequestIdsForStatus,
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
