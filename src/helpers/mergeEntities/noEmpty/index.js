import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import mergeDeepWith from '@misakey/helpers/mergeDeepWith';

// take first if second is empty
const noEmptyOverride = (oldValue, newValue) => {
  if (isEmpty(newValue) || isNil(newValue)) {
    return oldValue;
  }
  return newValue;
};

export default (state, { entities }) => {
  let newState = { ...state };
  Object.entries(entities).forEach(([entityName, entity]) => {
    newState = {
      ...newState,
      [entityName]: mergeDeepWith(noEmptyOverride, state[entityName], entity),
    };
  });
  return newState;
};
