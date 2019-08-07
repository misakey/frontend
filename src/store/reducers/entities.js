// import merge from "lodash/merge";
import map from 'lodash/map';

import { createReducer, removeObjectInState, updateObjectInState } from 'store/reducers/helpers';
import {
  RECEIVE_ENTITIES,
  REMOVE_ENTITIES,
  RESET_ENTITIES,
  UPDATE_ENTITIES,
} from 'store/actions/entities';

const initialEntitiesState = {

};

function receiveEntities(state, action) {
  const { entities } = action;
  // return entities ? merge({}, state, { ...state.entities, ...entities }) : state;

  let newState = state;
  map(entities, (entity, entityName) => {
    newState = {
      ...newState,
      [entityName]: {
        ...state[entityName],
        ...entity,
      },
    };
  });

  return newState;
}

function removeEntities(state, action) {
  const newState = state;

  action.entities.map((entity) => {
    newState[action.entityType] = removeObjectInState(state[action.entityType], entity);
    return true;
  });

  return newState;
}

function resetEntities() {
  return initialEntitiesState;
}

function updateEntities(state, action) {
  const newState = state;

  action.entities.map((entity) => {
    newState[action.entityType] = {
      ...state[action.entityType],
      ...updateObjectInState(state[action.entityType], entity),
    };
    return true;
  });

  return newState;
}

export default createReducer(initialEntitiesState, {
  [RECEIVE_ENTITIES]: receiveEntities,
  [REMOVE_ENTITIES]: removeEntities,
  [RESET_ENTITIES]: resetEntities,
  [UPDATE_ENTITIES]: updateEntities,
});
