import { normalize } from 'normalizr';

import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import { updateIdentity } from '@misakey/react-auth/store/actions/auth';
import IdentitySchema from 'store/schemas/Identity';


export const userIdentityReceive = (identity) => (dispatch) => {
  const normalized = normalize(identity, IdentitySchema.entity);
  const { entities } = normalized;
  return Promise.all([
    dispatch(receiveEntities(entities)),
    dispatch(updateIdentity(identity)),
  ]);
};

export const userIdentityUpdate = (id, changes) => (dispatch) => {
  const entities = [{ id, changes }];
  return Promise.all([
    dispatch(updateEntities(entities, IdentitySchema)),
    dispatch(updateIdentity(changes)),
  ]);
};
