import { batch } from 'react-redux';
import { createSelector } from 'reselect';
import { normalize, denormalize } from 'normalizr';

import { LIFECYCLE, MEMBER_JOIN, MEMBER_LEAVE, MEMBER_KICK, MSG_FILE } from 'constants/app/boxes/events';
import { ALL } from 'constants/app/boxes/statuses';

import BoxesSchema from 'store/schemas/Boxes';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import BoxSenderSchema from 'store/schemas/Boxes/Sender';
import { BLUR_TEXT, CLEAR_TEXT } from 'store/actions/box';
import { actionCreators } from 'store/reducers/userBoxes/pagination/events';
import { actionCreators as fileEventsActionCreators, selectors as fileEventsSelectors } from 'store/reducers/userBoxes/pagination/events/files';
import { moveBackUpId } from 'store/reducers/userBoxes/pagination';

import { receiveEntities, updateEntities, removeEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

import { transformReferrerEvent, isMemberEventType } from 'helpers/boxEvent';
import pluck from '@misakey/helpers/pluck';
import propOr from '@misakey/helpers/propOr';
import props from '@misakey/helpers/props';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import without from '@misakey/helpers/without';
import omit from '@misakey/helpers/omit';
import prop from '@misakey/helpers/prop';

// CONSTANTS
const INITIAL_STATE = {};
const { addPaginatedId: addPaginatedEventId } = actionCreators;
const {
  addPaginatedId: addPaginatedFileEventId,
  removePaginatedId: removePaginatedFileEventId,
} = fileEventsActionCreators;
const { getItemCount: getFileItemCount } = fileEventsSelectors;

// HELPERS
const omitText = (values) => omit(values, ['text']);
const textProp = prop('text');

const getNextMembers = ({ type, sender }, members) => {
  if (type === MEMBER_JOIN) {
    const { result } = normalize(sender, BoxSenderSchema.entity);
    return members.concat(result);
  }

  if (type === MEMBER_LEAVE || type === MEMBER_KICK) {
    const { result } = normalize(sender, BoxSenderSchema.entity);
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

const makeGetEventSelector = () => createSelector(
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
export const receiveJoinedBoxes = (boxes, processStrategy = mergeReceiveNoEmpty) => (dispatch) => {
  const normalized = normalize(
    boxes.map((box) => ({ isMember: true, hasAccess: true, ...box })),
    BoxesSchema.collection,
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

  const normalized = normalize(
    nextBox,
    BoxesSchema.entity,
  );
  const { entities } = normalized;
  return Promise.resolve(
    dispatch(receiveEntities(entities, processStrategy)),
  ).then(() => normalized);
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

export const addBoxEvent = (id, nextEvent, isMyEvent = false, onNotifyEvent) => (
  dispatch,
  getState,
) => {
  const currentBox = getBoxById(getState(), id);

  const isLifecycle = nextEvent.type === LIFECYCLE;

  if (isNil(currentBox)) {
    // @FIXME for now if box is not in list and we receive a lifecycle event,
    // it's a close event that didn't come from owner (else they have the box in store for sure)
    // don't move up the box as the app will try to fetch it for displaying the list, but will
    // get forbidden error. This behavior will be soon replaced by user notifications and
    // closed box will not appear in list anymore
    return Promise.resolve(isLifecycle ? undefined : dispatch(moveBackUpId(id, ALL)));
  }

  const { events, eventsCount = 0, lifecycle, members, title } = currentBox;

  const lastEvent = nextEvent;

  const changes = {
    lastEvent,
    eventsCount: isMyEvent ? eventsCount : eventsCount + 1,
    lifecycle: isLifecycle ? lastEvent.content.state : lifecycle,
    // If we haven't fetch initial list of events, don't add the event to the list
    events: isNil(events) ? undefined : events.concat([nextEvent]),
  };

  if (isMemberEventType(lastEvent)) {
    if (!isEmpty(members)) {
      changes.members = getNextMembers(lastEvent, members);
    }
  }

  const normalized = normalize(nextEvent, BoxEventsSchema.entity);
  const { entities } = normalized;

  const fileEventItemCount = getFileItemCount(getState(), id);

  const actions = [
    receiveEntities(entities, mergeReceiveNoEmpty),
    updateEntities([{ id, changes }], BoxesSchema),
    moveBackUpId(id, ALL),
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

export const receiveWSEditEvent = (editEvent) => (dispatch, getState) => {
  const { referrerId, boxId } = editEvent;
  const fileEventItemCount = getFileItemCount(getState(), boxId);

  const getEventSelector = makeGetEventSelector();
  const referrerEvent = getEventSelector(getState(), referrerId);

  const changes = transformReferrerEvent(editEvent)(referrerEvent);

  const { type, id } = referrerEvent || {};

  return batch(() => {
    if (type === MSG_FILE && !isNil(fileEventItemCount)) {
      dispatch(removePaginatedFileEventId(boxId, id));
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
