import { ALL } from 'constants/app/boxes/statuses';
import userBoxesReducer, { REDUCER_KEY, getUserBoxesState, selectors } from '.';

describe('testing reducer userBoxesPagination', () => {
  describe('getUserBoxesState', () => {
    const itemCount = 5;
    const exStatus = ALL;
    const state = {
      userBoxesPagination: {
        [exStatus]: { itemCount },
      },
    };
    const STATUSES = [
      [exStatus],
      [undefined],
      [null],
      ['toto'],
    ];
    it.each(STATUSES)('should not throw, status %p', () => {
      expect(() => getUserBoxesState()(state)).not.toThrow();
    });
    it('should return state', () => {
      expect(getUserBoxesState()(state)).toBe(state.userBoxesPagination);
    });
  });
  describe('selectors', () => {
    const makeReducerState = (state) => ({
      userBoxesPagination: state,
    });

    describe('isEmpty', () => {
      const EMPTY_STATES = [
        ['undefined, null, 0', {
          [ALL]: { itemCount: undefined },
          other: { itemCount: null },
          one: { itemCount: 0 },
        }],
        ['0, 0, 0, 0', {
          [ALL]: { itemCount: 0 },
          other: { itemCount: 0 },
          one: { itemCount: 0 },
        }],
        ['null, null, null', {
          [ALL]: { itemCount: null },
          other: { itemCount: null },
          one: { itemCount: null },
        }],
        ['undefined, undefined, undefined', {
          [ALL]: { itemCount: undefined },
          other: { itemCount: undefined },
          one: { itemCount: undefined },
        }],
        ['unset, unset, unset', {
          [ALL]: {},
          other: {},
          one: {},
        }],
      ];

      it.each(EMPTY_STATES)('should return true %s', (text, subState) => {
        const state = makeReducerState(subState);
        expect(selectors.isEmpty(state)).toBe(true);
      });
      it('should return false, non empty', () => {
        const subState = {
          [ALL]: { itemCount: 5 },
          one: { itemCount: 2 },
          two: { itemCount: 0 },
          other: { itemCount: null },
        };
        const state = makeReducerState(subState);
        expect(selectors.isEmpty(state)).toBe(false);
      });
    });
  });

  describe('reducer', () => {
    it('should have reducer key', () => {
      expect(userBoxesReducer).toEqual(expect.objectContaining({
        [REDUCER_KEY]: expect.any(Function),
      }));
    });
    it('should return initial state', () => {
      // eslint-disable-next-line import/no-named-as-default-member
      expect(userBoxesReducer[REDUCER_KEY](undefined, {})).toEqual({});
    });
  });
});
