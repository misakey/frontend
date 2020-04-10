import routes from 'routes';
import { normalize } from 'normalizr';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import DataboxSchema from 'store/schemas/Databox';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import merge from '@misakey/helpers/merge';
import path from '@misakey/helpers/path';
import mapValues from '@misakey/helpers/mapValues';
import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { IS_PLUGIN } from 'constants/plugin';
import { updateAllRequestIdsForStatus } from './screens/allRequestIds';

// HELPERS
const mergeEntitiesDataboxes = (state, { entities }) => merge(
  {},
  state,
  { ...state.entities, ...entities },
);

const propOrNull = propOr(null);
const propOrEmpty = propOr({});

const mergeEntitiesDataboxesByProducer = (state, { entities }) => {
  const { databoxesByProducer, ...otherEntities } = entities;
  const newDataboxesByProducer = mapValues(
    databoxesByProducer,
    ({ databoxes, ...rest }, producerId) => {
      const databoxesOfProducer = propOrNull('databoxes', state.databoxesByProducer[producerId]);
      // if databoxesOfProducer haven't been fetched yet, we don't update them
      if (!isNil(databoxesOfProducer)) {
        return {
          databoxes: [...databoxesOfProducer, ...databoxes],
          ...rest,
        };
      }
      return state.databoxesByProducer[producerId];
    },
  );

  const newState = mapValues(otherEntities, (entity, entityName) => ({
    ...propOrEmpty(entityName, state),
    ...entity,
  }));

  return {
    ...state,
    ...newState,
    databoxesByProducer: newDataboxesByProducer,
  };
};

export const receiveDataboxesByProducer = (databoxesByProducer) => (dispatch) => {
  const normalized = normalize(databoxesByProducer, DataboxByProducerSchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};

export const addDataboxByProducer = ({ producerId, databox }) => (dispatch) => {
  const normalized = normalize(
    { producerId, databoxes: [databox] },
    DataboxByProducerSchema.entity,
  );
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities, mergeEntitiesDataboxesByProducer)));
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

export const setDataboxMeta = (id, meta) => (dispatch) => {
  const entities = [{ id, changes: meta }];
  return Promise.resolve(dispatch(updateEntities(entities, DataboxSchema)));
};

export const setDataboxOwnerEmail = (id, ownerEmail) => (dispatch, getState) => {
  const store = getState();
  const prevOwner = path(['entities', 'databoxes', id, 'owner'], store);
  const nextOwner = { ...prevOwner, email: ownerEmail };
  const entities = [{ id, changes: { owner: nextOwner } }];
  return Promise.resolve(dispatch(updateEntities(entities, DataboxSchema)));
};

export const setUrlAccessRequest = (id, token) => (dispatch) => {
  const href = IS_PLUGIN ? window.env.APP_URL : window.env.href;
  const url = parseUrlFromLocation(`${routes.requests}#${token}`, href).href;
  const entities = [{ id, changes: { urlAccess: url } }];
  Promise.resolve(dispatch(updateEntities(entities, DataboxSchema)));
};

export const updateDatabox = (id, changes) => (dispatch) => {
  const updatedAt = changes.updatedAt || new Date().toISOString();
  const entities = [{ id, changes: { ...changes, updatedAt } }];

  if (changes.status) {
    return Promise.resolve(
      dispatch(updateEntities(entities, DataboxSchema)),
      dispatch(updateAllRequestIdsForStatus(id, changes.status)),
    );
  }

  return Promise.resolve(dispatch(updateEntities(entities, DataboxSchema)));
};
