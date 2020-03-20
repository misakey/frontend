import { schema } from 'normalizr';

import {
  mergeReceive, overrideReceive, mergeUpdate, overrideUpdate,
} from '../../reducers/helpers/processStrategies';

import {
  RECEIVE_ENTITIES, REMOVE_ENTITIES, RESET_ENTITIES, UPDATE_ENTITIES,
  receiveEntities, receiveEntitiesMerge,
  removeEntities, resetEntities,
  updateEntities, updateEntitiesOverride,
} from './index';

describe('testing entities actions', () => {
  const entities = [{ id: 55 }, { id: 56565 }, { id: 41 }];
  const entitySchema = new schema.Entity('boats', {});
  const processStrategy = jest.fn();

  describe('RECEIVE_ENTITIES', () => {
    it('should create a RECEIVE_ENTITIES action with default values', () => {
      expect(receiveEntities()).toEqual({
        type: RECEIVE_ENTITIES,
        entities: [],
        processStrategy: overrideReceive,
      });
    });
    it('should create a RECEIVE_ENTITIES action', () => {
      expect(receiveEntities(entities)).toEqual({
        type: RECEIVE_ENTITIES,
        entities,
        processStrategy: overrideReceive,
      });
    });
    it('should create a RECEIVE_ENTITIES action with processStrategy', () => {
      expect(receiveEntities(entities, processStrategy)).toEqual({
        type: RECEIVE_ENTITIES,
        entities,
        processStrategy,
      });
    });
    it('should create a RECEIVE_ENTITIES action with specific processStrategy when calling receiveEntitiesMerge', () => {
      expect(receiveEntitiesMerge(entities)).toEqual({
        type: RECEIVE_ENTITIES,
        entities,
        processStrategy: mergeReceive,
      });
    });
  });
  describe('REMOVE_ENTITIES', () => {
    it('should create a REMOVE_ENTITIES action with default values', () => {
      expect(removeEntities(undefined, entitySchema)).toEqual(expect.objectContaining({
        type: REMOVE_ENTITIES,
        entities: [],
        entitySchema,
      }));
    });
    it('should create a REMOVE_ENTITIES action', () => {
      expect(removeEntities(entities, entitySchema)).toEqual({
        type: REMOVE_ENTITIES,
        entities,
        entitySchema,
      });
    });
  });
  describe('RESET_ENTITIES', () => {
    it('should create a RESET_ENTITIES action', () => {
      expect(resetEntities()).toEqual({
        type: RESET_ENTITIES,
      });
    });
  });
  describe('UPDATE_ENTITIES', () => {
    it('should create an UPDATE_ENTITIES action with default values', () => {
      expect(updateEntities(undefined, entitySchema)).toEqual({
        type: UPDATE_ENTITIES,
        entities: [],
        entitySchema,
        processStrategy: mergeUpdate,
      });
    });
    it('should create an UPDATE_ENTITIES action', () => {
      const entityChanges = [{ id: 15, changes: { name: 'toto' } }];
      expect(updateEntities(entityChanges, entitySchema)).toEqual({
        type: UPDATE_ENTITIES,
        entities: entityChanges,
        entitySchema,
        processStrategy: mergeUpdate,
      });
    });
    it('should create an UPDATE_ENTITIES action with processStrategy', () => {
      const entityChanges = [{ id: 15, changes: { name: 'toto' } }];
      expect(updateEntities(entityChanges, entitySchema, processStrategy)).toEqual({
        type: UPDATE_ENTITIES,
        entities: entityChanges,
        entitySchema,
        processStrategy,
      });
    });
    it('should create an UPDATE_ENTITIES action with specific processStrategy when calling updateEntitiesOverride', () => {
      const entityChanges = [{ id: 15, changes: { name: 'toto' } }];
      expect(updateEntitiesOverride(entityChanges, entitySchema)).toEqual({
        type: UPDATE_ENTITIES,
        entities: entityChanges,
        entitySchema,
        processStrategy: overrideUpdate,
      });
    });
  });
});
