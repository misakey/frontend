import { SIGN_OUT } from '@misakey/auth/store/actions/auth';
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import createResetOnSignOutReducer, { wrapReducerWithResetOnSignOut } from '.';

describe('testing helpers createResetOnSignOutReducer', () => {
  const initialState = { auth: false };
  const ACTION = Symbol('ACTION');
  const onAction = (state) => ({ ...state, auth: true });
  const handlers = {
    [ACTION]: onAction,
  };

  describe('createResetOnSignOutReducer', () => {
    const reducer = createResetOnSignOutReducer(initialState, handlers);
    it('should return initial state', () => {
      expect(reducer(undefined, {})).toEqual(initialState);
    });
    it('should handle ACTION', () => {
      const nextState = { auth: true };
      expect(reducer(initialState, { type: ACTION }))
        .toEqual(nextState);
    });
    describe('on SIGN_OUT return initial state', () => {
      it('should handle SIGN_OUT and return initial state', () => {
        expect(reducer(initialState, { type: SIGN_OUT }))
          .toEqual(initialState);
      });
      it('should handle SIGN_OUT and return initial state', () => {
        const otherState = { auth: true };
        expect(reducer(otherState, { type: SIGN_OUT }))
          .toEqual(initialState);
      });
    });
  });

  describe('wrapReducerWithResetOnSignOut', () => {
    const createFn = (init, extraReducers) => createReducer(
      init,
      { ...handlers, ...extraReducers },
    );
    const reducer = wrapReducerWithResetOnSignOut(initialState, undefined, createFn);
    it('should return initial state', () => {
      expect(reducer(undefined, {})).toEqual(initialState);
    });
    it('should handle ACTION', () => {
      const nextState = { auth: true };
      expect(reducer(initialState, { type: ACTION }))
        .toEqual(nextState);
    });
    describe('on SIGN_OUT return initial state', () => {
      it('should handle SIGN_OUT and return initial state', () => {
        expect(reducer(initialState, { type: SIGN_OUT }))
          .toEqual(initialState);
      });
      it('should handle SIGN_OUT and return initial state', () => {
        const otherState = { auth: true };
        expect(reducer(otherState, { type: SIGN_OUT }))
          .toEqual(initialState);
      });
    });
  });
});
