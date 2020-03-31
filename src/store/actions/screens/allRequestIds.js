export const SET_ALL_REQUEST_IDS_FOR_STATUS = Symbol('SET_ALL_REQUEST_IDS_FOR_STATUS');
export const ADD_TO_ALL_REQUEST_IDS_FOR_STATUS = Symbol('ADD_TO_ALL_REQUEST_IDS_FOR_STATUS');
export const REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS = Symbol('REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS');

export function setAllRequestIdsForStatus(ids, status) {
  return {
    type: SET_ALL_REQUEST_IDS_FOR_STATUS,
    ids,
    status,
  };
}

export function addToAllRequestIdsForStatus(id, status, head = true) {
  return {
    type: ADD_TO_ALL_REQUEST_IDS_FOR_STATUS,
    id,
    status,
    head,
  };
}

export function removeFromAllRequestIdsForStatus(id, status) {
  return {
    type: REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS,
    id,
    status,
  };
}
