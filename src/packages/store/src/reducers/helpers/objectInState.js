export function removeObjectInState(state, objectId) {
  if (!state || !state[objectId]) {
    return state;
  }

  const newState = state;
  newState.splice(objectId, 1);

  return newState;
}

export function updateObjectInState(state, { changes, id }, idAttribute = 'id') {
  const item = state[id];
  if (!item) {
    return {};
  }


  // Be sure that entities don't need id modifications
  return { [changes[idAttribute] || id]: { ...item, ...changes } };
}
