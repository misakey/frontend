import { normalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

import isEmpty from '@misakey/helpers/isEmpty';
import mergeWith from '@misakey/helpers/mergeWith';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export const RECEIVE_APPLICATIONS_LINKED_IDS = Symbol('RECEIVE_APPLICATIONS_LINKED_IDS');
export const RECEIVE_APPLICATIONS_SUGGESTED_IDS = Symbol('RECEIVE_APPLICATIONS_SUGGESTED_IDS');

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

const receiveApplicationsLinkedIds = (linkedIds) => ({
  type: RECEIVE_APPLICATIONS_LINKED_IDS,
  linkedIds,
});

const receiveApplicationsSuggestedIds = (suggestedIds) => ({
  type: RECEIVE_APPLICATIONS_SUGGESTED_IDS,
  suggestedIds,
});

export function searchApplications(searchResponse) {
  return (dispatch) => {
    const { linkedApplications, suggestedApplications } = objectToCamelCase(searchResponse);

    const { result: linkedResult, entities: linkedEntities } = normalize(
      linkedApplications.map(objectToCamelCase),
      ApplicationSchema.collection,
    );

    const { result: suggestedResult, entities: suggestedEntities } = normalize(
      suggestedApplications.map(objectToCamelCase),
      ApplicationSchema.collection,
    );

    const applications = { ...linkedEntities.applications, ...suggestedEntities.applications };
    const entities = { applications };

    return Promise.all([
      dispatch(receiveEntities(entities, mergeEntitiesNoEmpty)),
      // could have multiple times same id if source has duplicates => uniq ?
      dispatch(receiveApplicationsLinkedIds(linkedResult)),
      dispatch(receiveApplicationsSuggestedIds(suggestedResult)),
    ]);
  };
}
