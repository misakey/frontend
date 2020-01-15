import { normalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';
import isEmpty from '@misakey/helpers/isEmpty';
import uniq from '@misakey/helpers/uniq';
import mergeWith from '@misakey/helpers/mergeWith';

export const APPLICATIONS_IDS_ADD = 'APPLICATIONS_IDS_ADD';
export const APPLICATIONS_IDS_REMOVE = 'APPLICATIONS_IDS_REMOVE';
export const APPLICATIONS_IDS_OVERRIDE = 'APPLICATIONS_IDS_OVERRIDE';
export const APPLICATIONS_RESET = 'APPLICATIONS_RESET';

export const APPLICATIONS_SELECTED_TOGGLE = Symbol('APPLICATIONS_SELECTED_TOGGLE');
export const APPLICATIONS_SELECTED_SET = Symbol('APPLICATIONS_SELECTED_SET');

// HELPERS
// do not override destination if source is empty
const noEmptyOverride = (dest, src) => {
  if (isEmpty(src)) {
    return dest;
  }
  return undefined;
};

const mergeEntitiesNoEmpty = (state, { entities }) => mergeWith(
  {},
  state,
  { ...state.entities, ...entities },
  noEmptyOverride,
);


function applicationsIdsOverride(ids) {
  return {
    type: APPLICATIONS_IDS_OVERRIDE,
    ids,
  };
}

export function applicationsReset() {
  return {
    type: APPLICATIONS_RESET,
  };
}

export function applicationsOnFetch(applications) {
  return (dispatch) => {
    const normalized = normalize(applications, ApplicationSchema.collection);
    const { result, entities } = normalized;
    return Promise.all([
      dispatch(receiveEntities(entities, mergeEntitiesNoEmpty)),
      // could have multiple times same id if source has duplicates => uniq
      dispatch(applicationsIdsOverride(uniq(result))),
    ]);
  };
}

export function toggleFromSelected(applicationId) {
  return {
    type: APPLICATIONS_SELECTED_TOGGLE,
    applicationId,
  };
}

export function setSelected(applicationIds) {
  return {
    type: APPLICATIONS_SELECTED_SET,
    applicationIds,
  };
}
