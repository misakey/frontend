import { normalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';

import { receiveApplications } from 'store/actions/applications';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export const RECEIVE_APPLICATIONS_LINKED_IDS = Symbol('RECEIVE_APPLICATIONS_LINKED_IDS');
export const RECEIVE_APPLICATIONS_SUGGESTED_IDS = Symbol('RECEIVE_APPLICATIONS_SUGGESTED_IDS');

// HELPERS
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
    const {
      linkedApplications: linked,
      suggestedApplications: suggested,
    } = objectToCamelCase(searchResponse);

    const linkedApplications = linked.map(objectToCamelCase);
    const suggestedApplications = suggested.map(objectToCamelCase);

    const { result: linkedResult } = normalize(
      linkedApplications,
      ApplicationSchema.collection,
    );

    const { result: suggestedResult } = normalize(
      suggestedApplications,
      ApplicationSchema.collection,
    );

    const applications = linkedApplications.concat(suggestedApplications);

    return Promise.all([
      dispatch(receiveApplications(applications)),
      // could have multiple times same id if source has duplicates => uniq ?
      dispatch(receiveApplicationsLinkedIds(linkedResult)),
      dispatch(receiveApplicationsSuggestedIds(suggestedResult)),
    ]);
  };
}
