import { denormalize, normalize } from 'normalizr';
import { createSelector } from 'reselect';
import { batch } from 'react-redux';

import pathOr from '@misakey/core/helpers/pathOr';
import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import IdentityWebauthnDeviceSchema from '@misakey/react-auth/store/schemas/WebauthnDevice/ByIdentity';
import WebauthnDeviceSchema from '@misakey/react-auth/store/schemas/WebauthnDevice';

// SELECTORS
export const getWebauthnDeviceSelector = createSelector(
  (state) => state.entities,
  (_, id) => id,
  (entities, id) => pathOr([], ['identityWebauthnDevices', id, 'devices'])(entities),
);

export const makeDenormalizeWebauthnDevicesSelector = () => createSelector(
  (state) => state.entities,
  (_, id) => id,
  (entities, id) => {
    const { devices } = denormalize(id, IdentityWebauthnDeviceSchema.entity, entities) || {};
    return devices;
  },
);


export const receiveWebauthnDevices = (data, identityId) => (dispatch) => {
  const normalized = normalize(
    { id: identityId, devices: data },
    IdentityWebauthnDeviceSchema.entity,
  );
  const { entities } = normalized;
  return dispatch(receiveEntities(entities));
};

export const addWebauthnDevice = (identityId, device) => (dispatch, getState) => {
  const { entities, result } = normalize(device, WebauthnDeviceSchema.entity);
  const devicesIds = getWebauthnDeviceSelector(getState(), identityId);

  return batch(() => {
    dispatch(receiveEntities(entities));
    dispatch(updateEntities(
      [{ id: identityId, changes: { devices: [...devicesIds, result] } }],
      IdentityWebauthnDeviceSchema,
    ));
  });
};

export const deleteWebauthnDevice = (identityId, devicesId) => (dispatch, getState) => batch(() => {
  const devicesIds = getWebauthnDeviceSelector(getState(), identityId);

  dispatch(updateEntities(
    [{ id: identityId, changes: { devices: devicesIds.filter((id) => id !== devicesId) } }],
    IdentityWebauthnDeviceSchema,
  ));
  dispatch(removeEntities([devicesId], WebauthnDeviceSchema));
});
