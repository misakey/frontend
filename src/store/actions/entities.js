export const RECEIVE_ENTITIES = 'RECEIVE_ENTITIES';
export const REMOVE_ENTITIES = 'REMOVE_ENTITIES';
export const RESET_ENTITIES = 'RESET_ENTITIES';
export const UPDATE_ENTITIES = 'UPDATE_ENTITIES';

export function receiveEntities(entities) {
  return {
    type: RECEIVE_ENTITIES,
    entities,
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
