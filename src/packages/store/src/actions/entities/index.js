export const RECEIVE_ENTITIES = Symbol('RECEIVE_ENTITIES');
export const REMOVE_ENTITIES = Symbol('REMOVE_ENTITIES');
export const RESET_ENTITIES = Symbol('RESET_ENTITIES');
export const UPDATE_ENTITIES = Symbol('UPDATE_ENTITIES');

export function receiveEntities(entities, processStrategy) {
  return {
    type: RECEIVE_ENTITIES,
    entities,
    processStrategy,
  };
}

export function removeEntities(entities = [{ id: null }], entityType) {
  return {
    type: REMOVE_ENTITIES,
    entities,
    entityType,
  };
}

export const resetEntities = () => ({
  type: RESET_ENTITIES,
});

export const updateEntities = (entities = [{ id: null, changes: {} }], entityType) => ({
  type: UPDATE_ENTITIES,
  entities,
  entityType,
});
