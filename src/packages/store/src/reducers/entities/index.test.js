import { schema } from 'normalizr';
import omit from '@misakey/core/helpers/omit';

import {
  mergeReceive, overrideReceive, mergeUpdate, overrideUpdate,
} from '../helpers/processStrategies';

import {
  RECEIVE_ENTITIES, REMOVE_ENTITIES, UPDATE_ENTITIES, RESET_ENTITIES,
} from '../../actions/entities';

import reducer, { INITIAL_STATE, makeReducer } from './index';

const ENTITY_SCHEMA = new schema.Entity('trees', {});

describe('testing entities reducer', () => {
  const { key } = ENTITY_SCHEMA;
  const SCHEMA = {
    entity: ENTITY_SCHEMA,
    collection: [ENTITY_SCHEMA],
  };

  const MERGE_KEY = 18;

  const DIRTY_STATE = {
    [key]: {
      [MERGE_KEY]: { id: MERGE_KEY, age: 1 },
      124: { id: 124, age: 176 },
    },
  };

  const EMPTY_STATE_SUBSTATE = {
    [key]: {},
  };

  const ENTITIES = {
    [key]: {
      8: { id: 8, age: 100 },
      44: { id: 44, age: 826 },
      2: { id: 2, age: 54 },
    },
  };

  const NOT_SCHEMAS = [
    [undefined],
    [null],
    [{}],
    [{ entity: {} }],
    [{ entity: ENTITY_SCHEMA }],
  ];

  const dumbProcessStrategy = jest.fn((state, { entities }) => ({
    ...state,
    ...entities,
  }));

  beforeEach(() => {
    dumbProcessStrategy.mockClear();
  });

  describe('testing default exported reducer', () => {
    it('should return initial state', () => {
      expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
    });
    describe('RECEIVE_ENTITIES', () => {
      it('should handle RECEIVE_ENTITIES, initialState', () => {
        expect(reducer(INITIAL_STATE, {
          type: RECEIVE_ENTITIES,
          entities: ENTITIES,
          processStrategy: overrideReceive,
        })).toEqual({
          ...INITIAL_STATE,
          ...ENTITIES,
        });
      });

      it('should handle RECEIVE_ENTITIES, any state, no merge', () => {
        expect(reducer(DIRTY_STATE, {
          type: RECEIVE_ENTITIES,
          entities: ENTITIES,
          processStrategy: overrideReceive,
        })).toEqual({
          [key]: {
            ...DIRTY_STATE[key],
            ...ENTITIES[key],
          },
        });
      });
      it('should handle RECEIVE_ENTITIES, any state, merge', () => {
        const mergeEntities = { [MERGE_KEY]: { id: MERGE_KEY, age: 42 } };
        const entities = { [key]: { ...ENTITIES[key], ...mergeEntities } };
        expect(reducer(DIRTY_STATE, {
          type: RECEIVE_ENTITIES,
          entities,
          processStrategy: overrideReceive,
        })).toEqual({
          [key]: {
            ...DIRTY_STATE[key],
            ...ENTITIES[key],
            ...mergeEntities,
          },
        });
      });
      it('should handle RECEIVE_ENTITIES, initialState, processStrategy', () => {
        const state = INITIAL_STATE;
        const action = {
          type: RECEIVE_ENTITIES,
          entities: ENTITIES,
        };
        const actionWithProcessStrategy = {
          ...action,
          processStrategy: dumbProcessStrategy,
        };
        expect(reducer(state, actionWithProcessStrategy)).toEqual(ENTITIES);

        expect(dumbProcessStrategy).toHaveBeenCalledWith(state, action);
      });
      it('should handle RECEIVE_ENTITIES, any state, processStrategy', () => {
        const state = DIRTY_STATE;
        const action = {
          type: RECEIVE_ENTITIES,
          entities: ENTITIES,
        };
        const actionWithProcessStrategy = {
          ...action,
          processStrategy: dumbProcessStrategy,
        };
        expect(reducer(state, actionWithProcessStrategy)).toEqual(ENTITIES);

        expect(dumbProcessStrategy).toHaveBeenCalledWith(state, action);
      });
      it('should handle UPDATE_ENTITIES, any state, mergeReceive strategy', () => {
        const state = DIRTY_STATE;
        const mergeEntities = { [MERGE_KEY]: { id: MERGE_KEY, name: 'cider' } };
        const entities = { [key]: { ...ENTITIES[key], ...mergeEntities } };
        const action = {
          type: RECEIVE_ENTITIES,
          entities,
          processStrategy: mergeReceive,
        };
        expect(reducer(state, action)).toEqual({
          [key]: {
            ...DIRTY_STATE[key],
            ...ENTITIES[key],
            [MERGE_KEY]: { ...mergeEntities[MERGE_KEY], ...DIRTY_STATE[key][MERGE_KEY] },
          },
        });
      });
    });

    describe('REMOVE_ENTITIES', () => {
      const TO_REMOVE = [{ id: 124 }, { id: MERGE_KEY }];


      it.each(NOT_SCHEMAS)('should throw error, not a normalizr schema %p', (entitySchema) => {
        expect(() => reducer(undefined, {
          type: REMOVE_ENTITIES,
          entities: TO_REMOVE,
          entitySchema,
        })).toThrow();
      });

      it('should handle REMOVE_ENTITIES, initialState', () => {
        const state = INITIAL_STATE;
        const action = {
          type: REMOVE_ENTITIES,
          entities: TO_REMOVE,
          entitySchema: SCHEMA,
        };
        expect(reducer(state, action)).toEqual(INITIAL_STATE);
      });
      it('should handle REMOVE_ENTITIES, any state', () => {
        const state = DIRTY_STATE;
        const action = {
          type: REMOVE_ENTITIES,
          entities: TO_REMOVE,
          entitySchema: SCHEMA,
        };
        expect(reducer(state, action)).toEqual(EMPTY_STATE_SUBSTATE);
      });
      it('should handle REMOVE_ENTITIES, any state', () => {
        const entities = [{ id: 124 }];
        const state = DIRTY_STATE;
        const action = {
          type: REMOVE_ENTITIES,
          entities,
          entitySchema: SCHEMA,
        };
        const omitted = entities.map(({ id }) => id);
        expect(reducer(state, action)).toEqual({ [key]: omit(DIRTY_STATE[key], omitted) });
      });
    });
    describe('UPDATE_ENTITIES', () => {
      const MERGE_CHANGES = { name: 'lemontree' };
      const TO_UPDATE = [
        { id: MERGE_KEY, changes: MERGE_CHANGES }, { id: 124, changes: { age: 3 } },
      ];
      const TO_UPDATE_NO_MERGE = [{ id: 124, changes: { age: 3 } }];
      const NO_UPDATE = [{ id: 21233, changes: { age: 0 } }];

      const updateProcessStrategy = jest.fn((
        state,
        { entities, entitySchema: { entity: { key: entityKey, idAttribute } } },
      ) => ({
        ...state,
        [entityKey]: entities.reduce((aggr, { id, changes }) => ({
          ...aggr,
          [id]: { [idAttribute]: id, ...changes },
        }), {}),
      }));

      beforeEach(() => {
        updateProcessStrategy.mockClear();
      });

      it.each(NOT_SCHEMAS)('should throw error, not a normalizr schema %p', (entitySchema) => {
        expect(() => reducer(undefined, {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema,
        })).toThrow();
      });

      it('should handle UPDATE_ENTITIES, initialState', () => {
        expect(reducer(INITIAL_STATE, {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema: SCHEMA,
          processStrategy: mergeUpdate,
        })).toEqual(INITIAL_STATE);
      });
      it('should handle UPDATE_ENTITIES, any state, no update', () => {
        expect(reducer(DIRTY_STATE, {
          type: UPDATE_ENTITIES,
          entities: NO_UPDATE,
          entitySchema: SCHEMA,
          processStrategy: mergeUpdate,
        })).toEqual(DIRTY_STATE);
      });
      it('should handle UPDATE_ENTITIES, any state, no merge', () => {
        expect(reducer(DIRTY_STATE, {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE_NO_MERGE,
          entitySchema: SCHEMA,
          processStrategy: mergeUpdate,
        })).toEqual({
          [key]: {
            ...DIRTY_STATE[key],
            124: { id: 124, age: 3 },
          },
        });
      });
      it('should handle UPDATE_ENTITIES, any state, merge', () => {
        expect(reducer(DIRTY_STATE, {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema: SCHEMA,
          processStrategy: mergeUpdate,
        })).toEqual({
          [key]: {
            [MERGE_KEY]: { ...DIRTY_STATE[key][MERGE_KEY], name: 'lemontree' },
            124: { id: 124, age: 3 },
          },
        });
      });
      it('should handle UPDATE_ENTITIES, initialState, processStrategy', () => {
        const state = INITIAL_STATE;
        const action = {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema: SCHEMA,
        };
        const actionWithProcessStrategy = {
          ...action,
          processStrategy: updateProcessStrategy,
        };
        expect(reducer(state, actionWithProcessStrategy)).toEqual({
          [key]: {
            [MERGE_KEY]: { id: MERGE_KEY, name: 'lemontree' },
            124: { id: 124, age: 3 },
          },
        });

        expect(updateProcessStrategy).toHaveBeenCalledWith(state, action);
      });
      it('should handle UPDATE_ENTITIES, any state, processStrategy', () => {
        const state = DIRTY_STATE;
        const action = {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema: SCHEMA,
        };
        const actionWithProcessStrategy = {
          ...action,
          processStrategy: updateProcessStrategy,
        };
        expect(reducer(state, actionWithProcessStrategy)).toEqual({
          [key]: {
            [MERGE_KEY]: { id: MERGE_KEY, name: 'lemontree' },
            124: { id: 124, age: 3 },
          },
        });

        expect(updateProcessStrategy).toHaveBeenCalledWith(state, action);
      });
      it('should handle UPDATE_ENTITIES, any state, overrideUpdate strategy', () => {
        const state = DIRTY_STATE;
        const action = {
          type: UPDATE_ENTITIES,
          entities: TO_UPDATE,
          entitySchema: SCHEMA,
          processStrategy: overrideUpdate,
        };

        expect(reducer(state, action)).toEqual({
          [key]: {
            ...DIRTY_STATE[key],
            [MERGE_KEY]: { id: MERGE_KEY, ...MERGE_CHANGES },
            124: { id: 124, age: 3 },
          },
        });
      });
    });
    describe('RESET_ENTITIES', () => {
      it('should handle RESET_ENTITIES, initialState', () => {
        expect(reducer(INITIAL_STATE, {
          type: RESET_ENTITIES,
        })).toEqual(INITIAL_STATE);
      });
      it('should handle RESET_ENTITIES, any state', () => {
        expect(reducer(DIRTY_STATE, {
          type: RESET_ENTITIES,
        })).toEqual(INITIAL_STATE);
      });
    });
  });

  describe('testing named reducer factory', () => {
    const OTHER_INITIAL_STATE = {
      flowers: {},
    };
    const REDUCER = makeReducer(OTHER_INITIAL_STATE);
    describe('RESET_ENTITIES', () => {
      it('should handle RESET_ENTITIES, initialState', () => {
        expect(REDUCER(OTHER_INITIAL_STATE, {
          type: RESET_ENTITIES,
        })).toEqual(OTHER_INITIAL_STATE);
      });
      it('should handle RESET_ENTITIES, any state', () => {
        expect(REDUCER(DIRTY_STATE, {
          type: RESET_ENTITIES,
        })).toEqual(OTHER_INITIAL_STATE);
      });
    });
  });
});
