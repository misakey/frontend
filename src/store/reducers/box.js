import { LIFECYCLE } from 'constants/app/boxes/events';
import BoxesSchema from 'store/schemas/Boxes';
import BoxEventsSchema from 'store/schemas/Boxes/Events';

import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import { moveBackUpId, removeFromPaginations } from 'store/reducers/userBoxes/pagination';
import { createSelector } from 'reselect';
import { normalize, denormalize } from 'normalizr';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import pluck from '@misakey/helpers/pluck';
import propOr from '@misakey/helpers/propOr';
import props from '@misakey/helpers/props';
import isNil from '@misakey/helpers/isNil';
import last from '@misakey/helpers/last';

// SELECTORS
export const makeDenormalizeBoxSelector = () => createSelector(
  (state) => state.entities,
  (_, id) => id,
  (entities, id) => denormalize(id, BoxesSchema.entity, entities),
);

export const makeGetMissingPublicKeysSelector = () => createSelector(
  (state) => state.entities,
  (_, properties) => properties,
  (entities, { publicKeysWeCanDecryptFrom, ids }) => denormalize(
    ids,
    BoxesSchema.collection,
    entities,
  )
    .filter(({ publicKey }) => !publicKeysWeCanDecryptFrom.has(publicKey)),
);

export const makeGetBoxesPublicKeysSelector = () => createSelector(
  (state) => state.entities.boxes,
  (_, ids) => ids,
  (entities, ids) => (isNil(ids) ? [] : pluck('publicKey', props(ids, entities))),
);

const getBoxSelector = createSelector(
  (state) => state.entities.boxes,
  (items) => (id) => propOr(null, id)(items),
);

const getBoxSendersIdsSelector = createSelector(
  (state) => state.entities,
  (items) => (id) => {
    const { events = [] } = denormalize(id, BoxesSchema.entity, items) || {};
    return [...new Set(pluck('sender', events))];
  },
);

export const getBoxById = (state, id) => getBoxSelector(state)(id);
export const getBoxSendersIds = (state, id) => getBoxSendersIdsSelector(state)(id);

// THUNKS
export const removeBox = (id) => (dispatch, getState) => {
  const currentBox = getBoxById(getState(), id);

  const { events = [] } = currentBox;

  return Promise.all([
    dispatch(removeEntities(events, BoxEventsSchema)),
    dispatch(removeEntities([{ id }], BoxesSchema)),
    dispatch(removeFromPaginations(id)),
  ]);
};

export const editBoxEvent = (id, event) => (dispatch, getState) => {
  const { id: eventId } = event;

  const currentBox = getBoxById(getState(), id);
  const { events = [] } = currentBox;

  const nextEvents = events.reduce((acc, prevEvent, index) => {
    if (prevEvent.id === eventId) {
      acc[index] = event;
    } else {
      acc[index] = prevEvent;
    }

    return acc;
  }, []);

  const changes = {
    events: nextEvents,
  };

  return Promise.all([
    dispatch(updateEntities([{ id: eventId, changes: event }], BoxEventsSchema)),
    dispatch(updateEntities([{ id, changes }], BoxesSchema)),
    dispatch(moveBackUpId(id)),
  ]);
};

export const addBoxEvents = (id, nextEvents) => (dispatch, getState) => {
  const currentBox = getBoxById(getState(), id);
  const { events = [] } = currentBox;

  const lastEvent = last(nextEvents);
  const changes = {
    lastEvent,
    ...(lastEvent.type === LIFECYCLE ? { lifecycle: lastEvent.content.state } : {}),
    events: events.concat(nextEvents),
  };

  const normalized = normalize(nextEvents, BoxEventsSchema.collection);
  const { entities } = normalized;


  return Promise.all([
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
    dispatch(updateEntities([{ id, changes }], BoxesSchema)),
    dispatch(moveBackUpId(id)),
  ]);
};

export const receiveBoxEvents = (id, nextEvents) => (dispatch, getState) => {
  const currentBox = getBoxById(getState(), id);
  const { events = [] } = currentBox;

  const changes = {
    events: events.concat(nextEvents),
  };

  const normalized = normalize(nextEvents, BoxEventsSchema.collection);
  const { entities } = normalized;

  return Promise.all([
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
    dispatch(updateEntities([{ id, changes }], BoxesSchema)),
  ]);
};

export const updateAccessesEvents = (id, newAccesses) => (dispatch) => {
  const normalized = normalize(newAccesses, BoxEventsSchema.collection);
  const { entities, result } = normalized;
  const changes = {
    accesses: result,
  };

  return Promise.all([
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
    dispatch(updateEntities([{ id, changes }], BoxesSchema)),
  ]);
};
