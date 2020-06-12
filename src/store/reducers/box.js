import { createSelector } from 'reselect';
import propOr from '@misakey/helpers/propOr';
import { normalize } from 'normalizr';
import BoxesSchema from 'store/schemas/Boxes';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

// SELECTORS
const getBoxSelector = createSelector(
  (state) => state.entities.boxes,
  (items) => (id) => propOr(null, id)(items),
);

export const getBoxById = (state, id) => getBoxSelector(state)(id);

export const addBoxEvents = (id, event) => (dispatch, getState) => {
  const changes = { updatedAt: event.serverEventCreatedAt };
  const actions = [];

  const currentBox = getBoxById(getState(), id);
  const { events = [] } = currentBox;

  const normalized = normalize(event, BoxEventsSchema.entity);
  const { entities } = normalized;
  changes.events = [...events, event];

  actions.push(receiveEntities(entities, mergeReceiveNoEmpty));
  actions.push(updateEntities([{ id, changes }], BoxesSchema));

  return Promise.all(actions.map(dispatch));
};
