import { normalize } from 'normalizr';
import map from '@misakey/core/helpers/map';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import concat from '@misakey/core/helpers/concat';
import mergeDeepRight from '@misakey/core/helpers/mergeDeepRight';
import mergeDeepWith from '@misakey/core/helpers/mergeDeepWith';
import mergeDeepWithKey from '@misakey/core/helpers/mergeDeepWithKey';


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
export const noEmptyOverride = (oldValue, newValue) => {
  if (isEmpty(newValue) || isNil(newValue)) {
    return oldValue;
  }
  return newValue;
};

// same as noEmptyOverride, but allow nulling values
export const noEmptyNullableOverride = (oldValue, newValue) => {
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

export const makeMergeReceiveOneToMany = (manyKey) => (state, { entities }) => {
  let newState = state;
  Object.entries(entities).forEach(([entityName, entity]) => {
    newState = {
      ...newState,
      [entityName]: mergeDeepWithKey(
        (key, l, r) => (key === manyKey ? concat(l, r) : r),
        state[entityName],
        entity,
      ),
    };
  });
  return newState;
};
