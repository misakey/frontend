import { normalize } from 'normalizr';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveEntities } from '@misakey/store/actions/entities';
import merge from '@misakey/helpers/merge';


// HELPERS
const mergeEntitiesDataboxes = (state, { entities }) => merge(
  {},
  state,
  { ...state.entities, ...entities },
);
export const receiveDataboxesByProducer = (databoxesByProducer) => (dispatch) => {
  const normalized = normalize(databoxesByProducer, DataboxByProducerSchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};

export const receiveDatabox = (databox) => (dispatch) => {
  const { producerId } = databox;

  const normalized = normalize(
    { producerId, databoxes: [databox] },
    DataboxByProducerSchema.entity,
  );
  const { entities } = normalized;

  return Promise.all([
    dispatch(receiveEntities(entities, mergeEntitiesDataboxes)),
  ]);
};
