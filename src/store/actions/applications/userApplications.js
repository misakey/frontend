
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import UserApplicationSchema from 'store/schemas/UserApplications';

export const receiveUserApplications = (userApplications) => (dispatch) => {
  const normalized = normalize(userApplications, UserApplicationSchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};
