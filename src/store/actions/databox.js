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
import pick from '@misakey/helpers/pick';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { METADATA } from 'constants/databox/event';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { getRequestById } from 'store/reducers/request';
import { updatePaginationsToStatus } from 'store/reducers/userRequests/pagination';


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

// used in `withBulkContact`
export const receiveDataboxesByProducer = (databoxesByProducer) => (dispatch) => {
  const normalized = normalize(databoxesByProducer, DataboxByProducerSchema.entity);
  const { entities } = normalized;
  return Promise.resolve(dispatch(receiveEntities(entities)));
};

// UNUSED
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
  const href = window.env;
  const url = parseUrlFromLocation(`${routes.requests}#${token}`, href).href;
  const entities = [{ id, changes: { urlAccess: url } }];
  Promise.resolve(dispatch(updateEntities(entities, DataboxSchema)));
};


export const updateDatabox = (id, changes, event = null) => (dispatch, getState) => {
  const now = new Date().toISOString();
  const updatedAt = changes.updatedAt || new Date().toISOString();
  const databoxChanges = { ...changes, updatedAt };
  const actions = [];

  if (!isNil(event)) {
    const { action, role, metadata } = event || {};

    const currentDatabox = getRequestById(getState(), id);
    const currentUser = getCurrentUserSelector(getState());
    const { logs = [] } = currentDatabox;

    // unique id generation
    const newLogId = new Date().getUTCMilliseconds();
    const metadataPaths = METADATA[action];
    const logMetadata = !isNil(metadataPaths)
      ? pick(metadataPaths, { ...changes, ...metadata })
      : null;

    const newLog = {
      id: newLogId,
      databoxId: id,
      authorRole: role,
      action,
      metadata: logMetadata,
      createdAt: now,
      author: {
        displayName: currentUser.displayName,
        avatarUri: currentUser.avatarUri,
      },
    };

    const normalized = normalize(newLog, ActivityLogsSchema.entity);
    const { entities } = normalized;
    databoxChanges.logs = [...logs, newLog];
    actions.push(receiveEntities(entities, mergeReceiveNoEmpty));
  }

  if (changes.status) {
    actions.push(updatePaginationsToStatus(id, changes.status));
  }
  actions.push(updateEntities([{ id, changes: databoxChanges }], DataboxSchema));

  return Promise.all(actions.map(dispatch));
};
