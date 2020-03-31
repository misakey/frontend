import {
  overrideReceive,
  mergeReceive,
  overrideUpdate,
  mergeUpdate,
} from '@misakey/store/reducers/helpers/processStrategies';

// ACTIONS
export const RECEIVE_ENTITIES = Symbol('RECEIVE_ENTITIES');
export const REMOVE_ENTITIES = Symbol('REMOVE_ENTITIES');
export const RESET_ENTITIES = Symbol('RESET_ENTITIES');
export const UPDATE_ENTITIES = Symbol('UPDATE_ENTITIES');

// ACTION CREATORS
export function receiveEntities(entities = [], processStrategy = overrideReceive) {
  return {
    type: RECEIVE_ENTITIES,
    entities,
    processStrategy,
  };
}

export const receiveEntitiesMerge = (entities = []) => receiveEntities(entities, mergeReceive);

export function removeEntities(entities = [], entitySchema) {
  return {
    type: REMOVE_ENTITIES,
    entities,
    entitySchema,
  };
}

export const resetEntities = (entitySchema) => ({
  type: RESET_ENTITIES,
  entitySchema,
});

export const updateEntities = (
  entities = [],
  entitySchema,
  processStrategy = mergeUpdate,
) => ({
  type: UPDATE_ENTITIES,
  entities,
  entitySchema,
  processStrategy,
});

export const updateEntitiesOverride = (
  entities = [],
  entitySchema,
) => updateEntities(entities, entitySchema, overrideUpdate);
