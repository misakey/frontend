export const SET_ALL_REQUEST_IDS_FOR_STATUS = Symbol('SET_ALL_REQUEST_IDS_FOR_STATUS');
export const UPDATE_ALL_REQUEST_IDS_FOR_STATUS = Symbol('UPDATE_ALL_REQUEST_IDS_FOR_STATUS');
export const REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS = Symbol('REMOVE_FROM_ALL_REQUEST_IDS_FOR_STATUS');

export function setAllRequestIdsForStatus(ids, status) {
  return {
    type: SET_ALL_REQUEST_IDS_FOR_STATUS,
    ids,
    status,
  };
}

export function updateAllRequestIdsForStatus(id, status, head = true) {
  return {
    type: UPDATE_ALL_REQUEST_IDS_FOR_STATUS,
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
