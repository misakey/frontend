import isFunction from '@misakey/helpers/isFunction';
import map from '@misakey/helpers/map';
import isSchemaEntity from '@misakey/helpers/isSchema/entity';
import createReducer from './helpers/createReducer';
import { removeObjectInState, updateObjectInState } from './helpers/objectInState';
import {
  RECEIVE_ENTITIES,
  REMOVE_ENTITIES,
  RESET_ENTITIES,
  UPDATE_ENTITIES,
} from '../actions/entities';

// CONSTANTS
const initialEntitiesState = {};

// HELPERS
function receiveEntities(state, action) {
  const { entities, processStrategy } = action;

  if (isFunction(processStrategy)) { return processStrategy(state, action); }

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
  let { entityType } = action;
  let entityId = 'id';

  if (isSchemaEntity(entityType)) {
    entityId = entityType.idAttribute;
    entityType = entityType.key;
  }

  const entitiesState = state[entityType];

  return {
    ...state,
    [entityType]: {
      ...entitiesState,
      ...action.entities
        .reduce(
          (aggr, entity) => (
            { ...aggr, ...removeObjectInState(entitiesState, entity, entityId) }),
          {},
        ),
    },
  };
}

function resetEntities() {
  return initialEntitiesState;
}

function updateEntities(state, action) {
  let { entityType } = action;
  let entityId = 'id';

  if (isSchemaEntity(entityType)) {
    entityId = entityType.idAttribute;
    entityType = entityType.key;
  }

  const entitiesState = state[entityType];

  return {
    ...state,
    [entityType]: {
      ...entitiesState,
      ...action.entities
        .reduce(
          (aggr, entity) => (
            { ...aggr, ...updateObjectInState(entitiesState, entity, entityId) }),
          {},
        ),
    },
  };
}

export const makeReducer = (initialState = initialEntitiesState) => createReducer(initialState, {
  [RECEIVE_ENTITIES]: receiveEntities,
  [REMOVE_ENTITIES]: removeEntities,
  [RESET_ENTITIES]: resetEntities,
  [UPDATE_ENTITIES]: updateEntities,
});

export default makeReducer();
