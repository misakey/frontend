import { UPDATE_GLOBAL_STATE, updateGlobals } from './index';

describe('testing global actions', () => {
  const globals = { hey: 'ya' };
  it('should create an UPDATE_GLOBAL_STATE action', () => {
    expect(updateGlobals(globals)).toEqual({
      type: UPDATE_GLOBAL_STATE,
      globals,
    });
  });
});
