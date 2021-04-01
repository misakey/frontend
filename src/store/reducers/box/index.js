import { batch } from 'react-redux';
import { createSelector } from 'reselect';
import { normalize, denormalize } from 'normalizr';

import { MEMBER_JOIN, MEMBER_LEAVE, MEMBER_KICK, MSG_FILE } from '@misakey/ui/constants/boxes/events';

import BoxesSchema from 'store/schemas/Boxes';
import BoxesByDatatagSchema from 'store/schemas/Boxes/ByDatatag';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import UserSchema from '@misakey/react-auth/store/schemas/User';
import { BLUR_TEXT, CLEAR_TEXT } from 'store/actions/box';
import { actionCreators } from 'store/reducers/userBoxes/pagination/events';
import { actionCreators as fileEventsActionCreators, selectors as fileEventsSelectors } from 'store/reducers/userBoxes/pagination/events/files';
import { moveBackUpId, actionCreators as boxesActionsCreators, selectors as boxPaginationSelectors } from 'store/reducers/userBoxes/pagination';
import { selectors as datatagSelectors } from 'store/reducers/datatag';

import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import createResetOnSignOutReducer from '@misakey/react-auth/store/reducers/helpers/createResetOnSignOutReducer';

import { transformReferrerEvent, isMemberEventType, isAccessModeEventType, getEventForNormalization } from 'helpers/boxEvent';
import pluck from '@misakey/core/helpers/pluck';
import propOr from '@misakey/core/helpers/propOr';
import props from '@misakey/core/helpers/props';
import path from '@misakey/core/helpers/path';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import without from '@misakey/core/helpers/without';
import omit from '@misakey/core/helpers/omit';
import prop from '@misakey/core/helpers/prop';
import { cleanDecryptedFile } from 'store/reducers/files/saved/decrypted';

// CONSTANTS
const INITIAL_STATE = {};
const { addPaginatedId: addPaginatedEventId } = actionCreators;
const { addPaginatedId: addPaginatedBoxId } = boxesActionsCreators;
const {
  addPaginatedId: addPaginatedFileEventId,
  removePaginatedId: removePaginatedFileEventId,
} = fileEventsActionCreators;
const { makeGetItemCount } = fileEventsSelectors;
const { makeIsPaginationAlreadyFetched } = boxPaginationSelectors;
const { getDatatagById } = datatagSelectors;

// HELPERS
const omitText = (values) => omit(values, ['text']);
const textProp = prop('text');

const contentValuePath = path(['content', 'value']);

const getNextMembers = ({ type, sender }, members) => {
  if (type === MEMBER_JOIN) {
    const { result } = normalize(sender, UserSchema.entity);
    if (!members.includes(result)) {
      return members.concat(result);
    }
  }

  if (type === MEMBER_LEAVE || type === MEMBER_KICK) {
    const { result } = normalize(sender, UserSchema.entity);
    return without(members, result);
  }

  return null;
};

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

export const makeGetEventSelector = () => createSelector(
  (state) => state.entities,
  (_, eventId) => eventId,
  (entities, id) => denormalize(id, BoxEventsSchema.entity, entities),
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

// REDUCER SELECTORS
export const makeGetBoxText = () => createSelector(
  (state) => state.box,
  (_, boxId) => boxId,
  (boxState, boxId) => textProp(prop(boxId, boxState)),
);

// THUNKS
export const receiveJoinedBoxesByDatatag = (
  boxes,
  { ownerOrgId, datatagId },
  processStrategy = mergeReceiveNoEmpty,
) => (dispatch, getState) => {
  const datatag = getDatatagById(getState(), datatagId);

  const entity = {
    organizationId: ownerOrgId,
    boxes: boxes.map((box) => ({
      isMember: true,
      hasAccess: true,
      ...box,
      lastEvent: getEventForNormalization(box.lastEvent),
    })),
    datatag,
    datatagId,
  };

  const normalized = normalize(
    entity,
    BoxesByDatatagSchema.entity,
  );
  const { entities, result } = normalized;
  const boxIds = path(['boxesByDatatag', result, 'boxes'], entities);

  dispatch(receiveEntities(entities, processStrategy));
  return Promise.resolve({ result: boxIds });
};

// @UNUSED
export const receiveJoinedBoxes = (
  boxes,
  { ownerOrgId, datatagId },
  processStrategy = mergeReceiveNoEmpty,
) => (dispatch, getState) => {
  const datatag = getDatatagById(getState(), datatagId);

  const entity = {
    organizationId: ownerOrgId,
    boxes: boxes.map((box) => ({
      isMember: true,
      hasAccess: true,
      ...box,
      lastEvent: getEventForNormalization(box.lastEvent),
    })),
    datatag,
    datatagId,
  };

  const normalized = normalize(
    entity,
    BoxesByDatatagSchema.entity,
  );
  const { entities } = normalized;

  dispatch(receiveEntities(entities, processStrategy));
  return Promise.resolve(normalized);
};

export const receiveJoinedBox = (box, processStrategy = mergeReceiveNoEmpty) => (
  dispatch, getState,
) => {
  const { id, lastEvent } = box;

  const nextBox = { isMember: true, hasAccess: true, ...box };
  if (isMemberEventType(lastEvent)) {
    const currentBox = getBoxById(getState(), id);
    if (!isNil(currentBox)) {
      const { members } = currentBox;
      if (!isEmpty(members)) {
        nextBox.members = getNextMembers(lastEvent, members);
      }
    }
  }

  nextBox.lastEvent = getEventForNormalization(nextBox.lastEvent);

  const normalized = normalize(
    nextBox,
    BoxesSchema.entity,
  );
  const { entities } = normalized;
  return Promise.resolve(
    dispatch(receiveEntities(entities, processStrategy)),
  ).then(() => normalized);
};

export const addJoinedBox = (box, filterId, search = null) => async (dispatch, getState) => {
  const isBoxPaginationAlreadyFetched = makeIsPaginationAlreadyFetched();
  const { result } = await Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmpty)));
  const shouldAddToPagination = isBoxPaginationAlreadyFetched(getState(), filterId, search);

  if (shouldAddToPagination) {
    dispatch(addPaginatedBoxId(filterId, result, search));
  }
};

export const removeBox = (id) => (dispatch, getState) => {
  const currentBox = getBoxById(getState(), id) || {};

  const { events = [] } = currentBox;

  return batch(() => {
    dispatch(removeEntities(events, BoxEventsSchema));
    dispatch(removeEntities([{ id }], BoxesSchema));
    return { id, ...currentBox };
  });
};

export const receivePublicInfo = (id, { creator, ...rest }) => (dispatch) => {
  const { entities, result } = normalize(creator, UserSchema.entity);
  return batch(() => {
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    dispatch(updateEntities([{ id, changes: { creator: result, ...rest } }], BoxesSchema));
  });
};

export const addBoxEvent = (id, nextEvent, isMyEvent = false, filterId, onNotifyEvent) => (
  dispatch,
  getState,
) => {
  const getFileItemCount = makeGetItemCount();
  const currentBox = getBoxById(getState(), id);

  if (isNil(currentBox)) {
    return Promise.resolve(dispatch(moveBackUpId(id, filterId)));
  }

  const { events, eventsCount = 0, members, title } = currentBox;

  const lastEvent = nextEvent;

  const changes = {
    lastEvent,
    eventsCount: isMyEvent ? eventsCount : eventsCount + 1,
    // If we haven't fetch initial list of events, don't add the event to the list
    events: isNil(events) ? undefined : events.concat([nextEvent]),
  };

  if (isMemberEventType(lastEvent)) {
    if (!isEmpty(members)) {
      changes.members = getNextMembers(lastEvent, members);
    }
  }

  if (isAccessModeEventType(lastEvent)) {
    const nextAccessMode = contentValuePath(lastEvent);
    if (!isNil(nextAccessMode)) {
      changes.accessMode = nextAccessMode;
    }
  }

  const normalized = normalize(getEventForNormalization(nextEvent), BoxEventsSchema.entity);
  const { entities } = normalized;

  const fileEventItemCount = getFileItemCount(getState(), id);

  const actions = [
    receiveEntities(entities, mergeReceiveNoEmpty),
    updateEntities([{ id, changes }], BoxesSchema),
    moveBackUpId(id, filterId),
  ];

  if (!isNil(fileEventItemCount) && lastEvent.type === MSG_FILE) {
    actions.push(addPaginatedFileEventId(id, lastEvent.id));
  }

  if (!isNil(events)) {
    actions.push(addPaginatedEventId(id, lastEvent.id));
  }

  const batchResult = batch(() => actions.forEach((action) => dispatch(action)));

  if (!isMyEvent) {
    onNotifyEvent(lastEvent, title);
  }

  return batchResult;
};

export const receiveBoxEvents = (id, events) => (dispatch, getState) => {
  const currentBox = getBoxById(getState(), id);
  const { events: currentEvents = [] } = currentBox;
  const newEvents = events.map(getEventForNormalization);

  const changes = {
    events: currentEvents.concat(newEvents),
  };

  const normalized = normalize(newEvents, BoxEventsSchema.collection);
  const { entities } = normalized;

  return Promise.all([
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
    dispatch(updateEntities([{ id, changes }], BoxesSchema)),
  ]);
};

export const receiveWSEditEvent = (editEvent) => (dispatch, getState) => {
  const getFileItemCount = makeGetItemCount();
  const { referrerId, boxId } = editEvent;
  const fileEventItemCount = getFileItemCount(getState(), boxId);

  const getEventSelector = makeGetEventSelector();
  const referrerEvent = getEventSelector(getState(), referrerId);

  const changes = transformReferrerEvent(editEvent)(referrerEvent);

  const { type, id, content } = referrerEvent || {};

  return batch(() => {
    if (type === MSG_FILE) {
      if (!isNil(fileEventItemCount)) {
        dispatch(removePaginatedFileEventId(boxId, id));
      }
      const { encryptedFileId } = content || {};
      if (!isNil(encryptedFileId)) {
        dispatch(cleanDecryptedFile(encryptedFileId));
      }
    }
    return Promise.resolve(dispatch(updateEntities(
      [{ id: referrerId, changes }],
      BoxEventsSchema,
    )));
  });
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

// REDUCER

// CALLBACKS
const onBlurText = (state, { boxId, text }) => ({ ...state, [boxId]: { text } });

const onClearText = (state, { boxId }) => {
  if (isNil(state[boxId])) {
    return state;
  }
  return { ...state, [boxId]: omitText(state[boxId]) };
};

const boxReducer = createResetOnSignOutReducer(INITIAL_STATE, {
  [BLUR_TEXT]: onBlurText,
  [CLEAR_TEXT]: onClearText,
});

export default {
  box: boxReducer,
};
