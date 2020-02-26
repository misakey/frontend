
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import UserApplicationSchema from 'store/schemas/UserApplications';

export const USER_APPLICATIONS_ADD = Symbol('USER_APPLICATIONS_ADD');
export const USER_APPLICATIONS_REMOVE = Symbol('USER_APPLICATIONS_REMOVE');

export const receiveUserApplications = (userApplications) => (dispatch) => {
  const normalized = normalize(userApplications, UserApplicationSchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};

export function addToUserApplications(workspace, mainDomain) {
  return {
    type: USER_APPLICATIONS_ADD,
    workspace,
    mainDomain,
  };
}

export function removeFromUserApplications(workspace, mainDomain) {
  return {
    type: USER_APPLICATIONS_REMOVE,
    workspace,
    mainDomain,
  };
}
