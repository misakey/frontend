
import ApplicationSchema from 'store/schemas/Application';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';

export const ACCESS_RESET = Symbol('ACCESS_RESET');

export const ACCESS_REQUEST_UPDATE = Symbol('ACCESS_REQUEST_UPDATE');
export const ACCESS_REQUEST_SET_PRODUCER_KEY = Symbol('ACCESS_REQUEST_SET_PRODUCER_KEY');

export const accessReset = () => ({
  type: ACCESS_RESET,
});

export const accessRequestUpdate = (accessRequest) => ({
  type: ACCESS_REQUEST_UPDATE,
  accessRequest,
});

const accessRequestSetProducerKey = (producerKey) => ({
  type: ACCESS_REQUEST_SET_PRODUCER_KEY,
  producerKey,
});

export const onReceiveProducer = (producer) => (dispatch) => {
  const normalized = normalize(producer, ApplicationSchema.entity);
  const { entities, result } = normalized;
  return Promise.all([
    dispatch(receiveEntities(entities)),
    dispatch(accessRequestSetProducerKey(result)),
  ]);
};
