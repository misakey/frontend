import { DRAFT, OPEN, DONE, CLOSED } from 'constants/databox/status';
import { INITIAL_STATE } from 'store/reducers/helpers/pagination';
import reducer, { REDUCER_KEY, getState, selectors, updatePaginationsToStatus, actions } from '.';

describe('testing reducer userRequestsPagination', () => {
  describe('getState', () => {
    const itemCount = 5;
    const exStatus = DRAFT;
    const state = {
      userRequestsPagination: {
        [exStatus]: { itemCount },
      },
    };
    const STATUSES = [
      [exStatus],
      [undefined],
      [null],
      ['toto'],
    ];
    it.each(STATUSES)('should not throw, status %p', (status) => {
      expect(() => getState(status)(state)).not.toThrow();
    });
    it('should return state', () => {
      expect(getState(exStatus)(state)).toBe(state.userRequestsPagination[exStatus]);
    });
  });
  describe('selectors', () => {
    const makeReducerState = (state) => ({
      userRequestsPagination: state,
    });

    describe('isEmpty', () => {
      const EMPTY_STATES = [
        ['undefined, null, 0, unset', {
          [DRAFT]: { itemCount: undefined },
          other: { itemCount: null },
          [CLOSED]: { itemCount: 0 },
          [DONE]: {},
        }],
        ['0, 0, 0, 0', {
          [DRAFT]: { itemCount: 0 },
          other: { itemCount: 0 },
          [CLOSED]: { itemCount: 0 },
          [DONE]: { itemCount: 0 },
        }],
        ['null, null, null, null', {
          [DRAFT]: { itemCount: null },
          other: { itemCount: null },
          [CLOSED]: { itemCount: null },
          [DONE]: { itemCount: null },
        }],
        ['undefined, undefined, undefined, undefined', {
          [DRAFT]: { itemCount: undefined },
          other: { itemCount: undefined },
          [CLOSED]: { itemCount: undefined },
          [DONE]: { itemCount: undefined },
        }],
        ['unset, unset, unset, unset', {
          [DRAFT]: { },
          other: { },
          [CLOSED]: { },
          [DONE]: {},
        }],
      ];

      it.each(EMPTY_STATES)('should return true %s', (text, subState) => {
        const state = makeReducerState(subState);
        expect(selectors.isEmpty(state)).toBe(true);
      });
      it('should return false, non empty', () => {
        const subState = {
          [DRAFT]: { itemCount: 5 },
          [CLOSED]: { itemCount: 2 },
          [DONE]: {},
          one: { itemCount: 0 },
          other: { itemCount: null },
          [OPEN]: { itemCount: undefined },
        };
        const state = makeReducerState(subState);
        expect(selectors.isEmpty(state)).toBe(false);
      });
    });
  });
  describe('thunks', () => {
    const dispatchMock = (...args) => Promise.resolve(...args);

    describe('updatePaginationsToStatus', () => {
      const id = 'A304Ku';
      it('should reject with error when status is unhandled', async () => {
        const status = 'unhandled';

        const thunk = updatePaginationsToStatus(id, status);
        expect.assertions(1);
        await expect(thunk(dispatchMock)).rejects.toEqual(expect.any(Error));
      });
      it('should resolve with 1 addPaginatedId action, 3 removePaginatedId actions', async () => {
        const status = DRAFT;
        const { [status]: statusActions, ...restActions } = actions;

        const expected = [
          {
            type: statusActions.ADD_PAGINATED_ID,
            id,
          },
          ...Object.values(restActions).map((action) => ({ type: action.REMOVE_PAGINATED_ID, id })),
        ];

        const thunk = updatePaginationsToStatus(id, status);
        expect.assertions(1);
        await expect(thunk(dispatchMock)).resolves.toEqual(expected);
      });
    });
  });
  describe('reducer', () => {
    it('should have reducer key', () => {
      expect(reducer).toEqual(expect.objectContaining({
        [REDUCER_KEY]: expect.any(Function),
      }));
    });
    it('should return initial state', () => {
      // eslint-disable-next-line import/no-named-as-default-member
      expect(reducer[REDUCER_KEY](undefined, {})).toEqual(expect.objectContaining({
        [DRAFT]: INITIAL_STATE,
        [OPEN]: INITIAL_STATE,
        [DONE]: INITIAL_STATE,
        [CLOSED]: INITIAL_STATE,
      }));
    });
  });
});
