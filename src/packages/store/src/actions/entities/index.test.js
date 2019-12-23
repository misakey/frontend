import {
  RECEIVE_ENTITIES, REMOVE_ENTITIES, RESET_ENTITIES, UPDATE_ENTITIES,
  receiveEntities, removeEntities, resetEntities, updateEntities,
} from './index';

describe('testing entities actions', () => {
  const entities = [{ id: 55 }, { id: 56565 }, { id: 41 }];
  const entityType = 'boats';

  it('should create a RECEIVE_ENTITIES action', () => {
    expect(receiveEntities(entities)).toEqual({
      type: RECEIVE_ENTITIES,
      entities,
    });
  });
  it('should create a REMOVE_ENTITIES action', () => {
    expect(removeEntities(entities, entityType)).toEqual({
      type: REMOVE_ENTITIES,
      entities,
      entityType,
    });
  });
  it('should create a RESET_ENTITIES action', () => {
    expect(resetEntities()).toEqual({
      type: RESET_ENTITIES,
    });
  });
  it('should create an UPDATE_ENTITIES action', () => {
    const entityChanges = [{ id: 15, changes: { name: 'toto' } }];
    expect(updateEntities(entityChanges, entityType)).toEqual({
      type: UPDATE_ENTITIES,
      entities: entityChanges,
      entityType,
    });
  });
});
