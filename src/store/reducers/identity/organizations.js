import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';
import { batch } from 'react-redux';

import pathOr from '@misakey/helpers/pathOr';
import isNil from '@misakey/helpers/isNil';
import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import OrganizationsByIdentitySchema from '@misakey/react-auth/store/schemas/Organizations/ByIdentity';
import OrganizationsSchema from '@misakey/react-auth/store/schemas/Organizations';

// SELECTORS
const getOrganizationsSelector = createSelector(
  (state) => state.entities,
  (_, id) => id,
  (entities, id) => pathOr([], ['identityOrganizations', id, 'organizations'])(entities),
);

export const selectors = {
  getOrganizations: getOrganizationsSelector,
  makeDenormalizeOrganizations: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => {
      const { organizations } = denormalize(
        id, OrganizationsByIdentitySchema.entity, entities,
      ) || {};
      return organizations;
    },
  ),
  makeDenormalizeOrganization: () => createSelector(
    (state) => state.entities,
    (_, id) => id,
    (entities, id) => (isNil(id) ? null : denormalize(
      id, OrganizationsSchema.entity, entities,
    )),
  ),
};

// THUNKS
export const receiveOrganizations = (data, identityId) => (dispatch) => {
  const normalized = normalize(
    { id: identityId, organizations: data },
    OrganizationsByIdentitySchema.entity,
  );
  const { entities } = normalized;
  return dispatch(receiveEntities(entities));
};

export const addOrganization = (identityId, organization) => (dispatch, getState) => {
  const { entities, result } = normalize(organization, OrganizationsSchema.entity);
  const organizationIds = getOrganizationsSelector(getState(), identityId);

  return batch(() => {
    dispatch(receiveEntities(entities));
    dispatch(updateEntities(
      [{ id: identityId, changes: { organizations: [...organizationIds, result] } }],
      OrganizationsByIdentitySchema,
    ));
  });
};

export const deleteOrganization = (identityId, organizationId) => (dispatch, getState) => batch(
  () => {
    const organizationIds = getOrganizationsSelector(getState(), identityId);

    dispatch(updateEntities(
      [{
        id: identityId,
        changes: { organizations: organizationIds.filter((id) => id !== organizationId) } }],
      OrganizationsByIdentitySchema,
    ));
    dispatch(removeEntities([organizationId], OrganizationsSchema));
  },
);
