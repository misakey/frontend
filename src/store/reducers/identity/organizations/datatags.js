import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';

import DatatagsByOrganizationSchema from 'store/schemas/Datatags/ByOrganization';
import DatatagsSchema from 'store/schemas/Datatags';

import { receiveEntities } from '@misakey/store/actions/entities';

import pathOr from '@misakey/helpers/pathOr';
import isNil from '@misakey/helpers/isNil';

// SELECTORS
const getDatatagsSelector = createSelector(
  (state) => state.entities,
  (_, { id }) => id,
  (entities, id) => pathOr([], ['organizationDatatags', id, 'datatags'])(entities),
);


export const selectors = {
  getDatatags: getDatatagsSelector,
  makeDenormalizeDatatags: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => {
      const { datatags } = denormalize(
        id, DatatagsByOrganizationSchema.entity, entities,
      ) || {};
      return datatags;
    },
  ),
  makeDenormalizeDatatag: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => (isNil(id) ? null : denormalize(
      id, DatatagsSchema.entity, entities,
    )),
  ),
};

// THUNKS
export const receiveDatatags = (data, { identityId, organizationId }) => (dispatch) => {
  const normalized = normalize(
    { id: organizationId, identityId, datatags: data },
    DatatagsByOrganizationSchema.entity,
  );
  const { entities } = normalized;
  return dispatch(receiveEntities(entities));
};
