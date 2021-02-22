import { createSelector } from 'reselect';
import { denormalize } from 'normalizr';

import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import omit from '@misakey/helpers/omit';
import isObject from '@misakey/helpers/isObject';
import isArray from '@misakey/helpers/isArray';
import isEmpty from '@misakey/helpers/isEmpty';
import isSchemaEntity from '@misakey/helpers/isSchema/entity';
import isNil from '@misakey/helpers/isNil';
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import {
  RECEIVE_ENTITIES,
  REMOVE_ENTITIES,
  RESET_ENTITIES,
  UPDATE_ENTITIES,
} from '@misakey/store/actions/entities';

// CONSTANTS
export const INITIAL_STATE = {};

// HELPERS
const idProp = prop('id');

const throwNotSchema = (entitySchema) => {
  const error = new Error('Not a normalizr schema!');
  if (!isObject(entitySchema)) {
    throw error;
  }
  const { entity, collection } = entitySchema;
  if (!isSchemaEntity(entity)) {
    throw error;
  }
  if (!isArray(collection)) {
    throw error;
  }
};

const throwNoProcessStrategy = (processStrategy) => {
  if (!isFunction(processStrategy)) {
    throw new Error('updateEntities, processStrategy is not a function!');
  }
};

// HANDLERS
function receiveEntities(state, { processStrategy, ...action }) {
  throwNoProcessStrategy(processStrategy);

  return processStrategy(state, action);
}

/**
 *
 * @param {Object} state
 * @param {Object} action
 * @param {{id: string}[]} action.entities
 * @param {{entity: {key: string}}} action.entitySchema
 */
function removeEntities(state, { entities, entitySchema }) {
  throwNotSchema(entitySchema);

  const { key } = entitySchema.entity;

  const subState = state[key];

  if (isEmpty(subState)) {
    return { ...state };
  }

  const toOmit = entities.map(idProp);

  const nextSubState = omit(subState, toOmit);

  return {
    ...state,
    [key]: nextSubState,
  };
}

const makeResetEntities = (initialState) => (state, { entitySchema }) => {
  if (isObject(entitySchema) && isSchemaEntity(entitySchema.entity)) {
    const { key } = entitySchema.entity;
    return {
      ...state,
      [key]: {},
    };
  }
  return initialState;
};

/**
 *
 * @param {Object} state
 * @param {Object} action
 * @param {Function} action.processStrategy
 * @param {{id: string}[]} action.entities
 * @param {{entity: {key: string, idAttribute: string}}} action.entitySchema
 */
function updateEntities(state, { processStrategy, ...action }) {
  throwNotSchema(action.entitySchema);

  throwNoProcessStrategy(processStrategy);

  return processStrategy(state, action);
}

// SELECTORS
export const makeGetEntitySelector = (entitySchema) => createSelector(
  (state) => state.entities,
  (_, id) => id,
  (entities, id) => (isNil(id) ? null : denormalize(id, entitySchema, entities)),
);

export const makeReducer = (
  initialState = INITIAL_STATE,
  extraReducers = {},
) => createReducer(initialState, {
  [RECEIVE_ENTITIES]: receiveEntities,
  [REMOVE_ENTITIES]: removeEntities,
  [RESET_ENTITIES]: makeResetEntities(initialState),
  [UPDATE_ENTITIES]: updateEntities,
  ...extraReducers,
});

export default makeReducer();
