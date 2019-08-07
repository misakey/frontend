export const UPDATE_GLOBAL_STATE = 'UPDATE_GLOBAL_STATE';

export const updateGlobals = globals => ({
  type: UPDATE_GLOBAL_STATE,
  ...globals,
});
