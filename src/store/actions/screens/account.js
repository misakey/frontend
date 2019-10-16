import { normalize } from 'normalizr';

import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import { updateProfile } from '@misakey/auth/store/actions/auth';
import UserSchema from 'store/schemas/User';


export const userProfileReceive = (profile) => (dispatch) => {
  const normalized = normalize(profile, UserSchema.entity);
  const { entities } = normalized;
  return Promise.all([
    dispatch(receiveEntities(entities)),
    dispatch(updateProfile(profile)),
  ]);
};

export const userProfileUpdate = (id, changes) => (dispatch) => {
  const entities = [{ id, changes }];
  return Promise.all([
    dispatch(updateEntities(entities, UserSchema.entity)),
    dispatch(updateProfile(changes)),
  ]);
};
