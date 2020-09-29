import { normalize } from 'normalizr';
import map from '@misakey/helpers/map';
import isEmpty from '@misakey/helpers/isEmpty';
import mergeDeepRight from '@misakey/helpers/mergeDeepRight';
import isNil from '@misakey/helpers/isNil';
import mergeDeepWith from '@misakey/helpers/mergeDeepWith';


// HELPERS

/**
 * merge updates into already existing entities
 * @param {Object} state
 * @param {Object} action
 * @param {{id: string, changes: Object}[]} action.entities
 * @param {{entity: {key: string, idAttribute: string}}} action.entitySchema
 */
export const mergeUpdate = (state, { entities, entitySchema }) => {
  const { idAttribute, key } = entitySchema.entity;

  const subState = state[key];

  if (isEmpty(subState)) {
    return { ...state };
  }

  const subStateKeys = Object.keys(subState || {});

  const changeEntities = entities
    .reduce((aggr, { id, changes }) => {
      if (subStateKeys.includes(id.toString())) {
        const entity = {
          [idAttribute]: id,
          ...changes,
        };
        return [...aggr, entity];
      }
      return aggr;
    }, []);

  if (isEmpty(changeEntities)) {
    return { ...state };
  }

  const { entities: toUpdate } = normalize(changeEntities, entitySchema.collection);

  return {
    ...state,
    [key]: mergeDeepRight(subState, toUpdate[key]),
  };
};

/**
 * override existing entities with updates
 * @param {Object} state
 * @param {Object} action
 * @param {{id: string, changes: Object}[]} action.entities
 * @param {{entity: {key: string, idAttribute: string}}} action.entitySchema
 */
export const overrideUpdate = (state, { entities, entitySchema }) => {
  const { idAttribute, key } = entitySchema.entity;

  const subState = state[key];

  if (isEmpty(subState)) {
    return { ...state };
  }

  const subStateKeys = Object.keys(subState || {});

  const changeEntities = entities
    .reduce((aggr, { id, changes }) => {
      if (subStateKeys.includes(id.toString())) {
        const entity = {
          [idAttribute]: id,
          ...changes,
        };
        return [...aggr, entity];
      }

      return aggr;
    }, []);

  if (isEmpty(changeEntities)) {
    return { ...state };
  }

  const { entities: toUpdate } = normalize(changeEntities, entitySchema.collection);

  return {
    ...state,
    [key]: {
      ...subState,
      ...toUpdate[key],
    },
  };
};

/**
 * override existing entities with received
 * @param {Object} state
 * @param {Object} action
 * @param {Object} action.entities
 */
export const overrideReceive = (state, { entities }) => {
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
};

/**
 * merge existing entities with received
 * @param {Object} state
 * @param {Object} action
 * @param {Object} action.entities
 */
export const mergeReceive = (state, { entities }) => mergeDeepRight(state, entities);

// take first if second is empty
const noEmptyOverride = (oldValue, newValue) => {
  if (isEmpty(newValue) || isNil(newValue)) {
    return oldValue;
  }
  return newValue;
};

// same as noEmptyOverride, but allow nulling values
const noEmptyNullableOverride = (oldValue, newValue) => {
  if (newValue === null) {
    return newValue;
  }
  return noEmptyOverride(oldValue, newValue);
};

/**
 * merge existing entities with received but skipping received empty values
 * @param {Object} state
 * @param {Object} action
 * @param {Object} action.entities
 */
export const mergeReceiveNoEmpty = (state, { entities }) => {
  let newState = { ...state };
  Object.entries(entities).forEach(([entityName, entity]) => {
    newState = {
      ...newState,
      [entityName]: mergeDeepWith(noEmptyOverride, state[entityName], entity),
    };
  });
  return newState;
};

export const mergeReceiveNoEmptyNullable = (state, { entities }) => {
  let newState = { ...state };
  Object.entries(entities).forEach(([entityName, entity]) => {
    newState = {
      ...newState,
      [entityName]: mergeDeepWith(noEmptyNullableOverride, state[entityName], entity),
    };
  });
  return newState;
};
