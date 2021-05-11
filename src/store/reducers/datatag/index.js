import DatatagSchema from '@misakey/react/auth/store/schemas/Datatags';
import { receiveEntities } from '@misakey/store/actions/entities';

import { normalize } from 'normalizr';
import { createSelector } from 'reselect';
import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

// SELECTORS
export const selectors = {
  makeGetDatatagById: () => createSelector(
    (state) => state.entities.datatags,
    (_, id) => id,
    (entities, id) => prop(id, entities),
  ),
  getDatatags: createSelector(
    (state) => state.entities.datatags,
    (entities) => (isNil(entities) ? entities : Object.values(entities)),
  ),
};


// THUNKS
export const receiveDatatags = (datatags) => (dispatch) => {
  const normalized = normalize(
    datatags,
    DatatagSchema.collection,
  );
  const { entities } = normalized;
  if (isEmpty(entities)) {
    return dispatch(receiveEntities({ datatags: [] }));
  }
  return dispatch(receiveEntities(entities));
};
