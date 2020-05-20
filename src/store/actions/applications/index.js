import { normalize } from 'normalizr';

import ApplicationByIdSchema from 'store/schemas/Application/ById';

import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

export const receiveApplications = (applications) => (dispatch) => {
  const normalized = normalize(
    applications.map(({ id, ...rest }) => ({ id, application: { id, ...rest } })),
    ApplicationByIdSchema.collection,
  );
  const { entities } = normalized;
  return dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
};
