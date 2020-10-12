import { OPEN, CLOSED } from 'constants/app/boxes/statuses';
import userBoxesReducer, { REDUCER_KEY, getUserBoxesState, selectors } from '.';

describe('testing reducer userBoxesPagination', () => {
  describe('getUserBoxesState', () => {
    const itemCount = 5;
    const exStatus = OPEN;
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
          [OPEN]: { itemCount: undefined },
          other: { itemCount: null },
          [CLOSED]: { itemCount: 0 },
        }],
        ['0, 0, 0, 0', {
          [OPEN]: { itemCount: 0 },
          other: { itemCount: 0 },
          [CLOSED]: { itemCount: 0 },
        }],
        ['null, null, null', {
          [OPEN]: { itemCount: null },
          other: { itemCount: null },
          [CLOSED]: { itemCount: null },
        }],
        ['undefined, undefined, undefined', {
          [OPEN]: { itemCount: undefined },
          other: { itemCount: undefined },
          [CLOSED]: { itemCount: undefined },
        }],
        ['unset, unset, unset', {
          [OPEN]: {},
          other: {},
          [CLOSED]: {},
        }],
      ];

      it.each(EMPTY_STATES)('should return true %s', (text, subState) => {
        const state = makeReducerState(subState);
        expect(selectors.isEmpty(state)).toBe(true);
      });
      it('should return false, non empty', () => {
        const subState = {
          [OPEN]: { itemCount: 5 },
          [CLOSED]: { itemCount: 2 },
          one: { itemCount: 0 },
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
