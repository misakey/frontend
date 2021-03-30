import { INITIAL_STATE, INITIAL_SUB_STATE, makePaginationReducer } from '.';

describe('testing pagination reducers helpers', () => {
  describe('makePaginationReducer', () => {
    const getState = (state) => state.test;
    const NO_GET_STATE = 'NO_GET_STATE';
    const TEST = 'TEST';
    const FACTORIES = [
      [
        NO_GET_STATE,
        makePaginationReducer(NO_GET_STATE),
        {},
      ],
      [
        TEST,
        makePaginationReducer(TEST, getState),
        expect.objectContaining({
          makeGetByPagination: expect.any(Function),
          makeGetBySearchPagination: expect.any(Function),
          makeGetItemCount: expect.any(Function),
          makeGetSearch: expect.any(Function),
        }),
      ],
    ];

    describe.each(FACTORIES)('reducer %s', (prefix, reducerProps, selectors) => {
      describe('actions, actionCreators', () => {
        const {
          receivePaginatedItemCount,
          receivePaginatedIds,
          addPaginatedId,
          removePaginatedId,
        } = reducerProps.actionCreators;

        const {
          RECEIVE_PAGINATED_ITEM_COUNT,
          RECEIVE_PAGINATED_IDS,
          ADD_PAGINATED_ID,
          REMOVE_PAGINATED_ID,
        } = reducerProps.actions;

        it('should contain actionCreators', () => {
          expect(reducerProps.actionCreators).toEqual(expect.objectContaining({
            receivePaginatedItemCount: expect.any(Function),
            receivePaginatedIds: expect.any(Function),
            addPaginatedId: expect.any(Function),
            removePaginatedId: expect.any(Function),
          }));
        });
        it('should contain actions', () => {
          expect(reducerProps.actions).toEqual(expect.objectContaining({
            RECEIVE_PAGINATED_ITEM_COUNT: expect.anything(),
            RECEIVE_PAGINATED_IDS: expect.anything(),
            ADD_PAGINATED_ID: expect.anything(),
            REMOVE_PAGINATED_ID: expect.anything(),
          }));
        });

        it('should create action RECEIVE_PAGINATED_ITEM_COUNT', () => {
          const filterId = 'test';
          const itemCount = 5;
          expect(receivePaginatedItemCount(filterId, itemCount)).toEqual({
            type: RECEIVE_PAGINATED_ITEM_COUNT,
            itemCount,
            filterId,
          });
        });
        it('should create action RECEIVE_PAGINATED_IDS', () => {
          const filterId = 'test';
          const offset = 10;
          const limit = 20;
          const ids = ['zsergt', '1fdrj', '38hu'];
          expect(receivePaginatedIds(filterId, offset, limit, ids)).toEqual({
            type: RECEIVE_PAGINATED_IDS,
            filterId,
            offset,
            limit,
            ids,
            search: null,
          });
        });
        it('should create action ADD_PAGINATED_ID', () => {
          const filterId = 'test';
          const id = 'defrgt7';
          expect(addPaginatedId(filterId, id)).toEqual({
            type: ADD_PAGINATED_ID,
            id,
            filterId,
            search: null,
          });
        });
        it('should create action REMOVE_PAGINATED_ID', () => {
          const filterId = 'test';
          const id = 'defrgt7';
          expect(removePaginatedId(filterId, id)).toEqual({
            type: REMOVE_PAGINATED_ID,
            id,
            filterId,
            search: null,
          });
        });
      });
      describe('selectors', () => {
        it(`should contain selectors ${selectors}`, () => {
          expect(reducerProps.selectors).toEqual(selectors);
        });
      });
      describe('reducer', () => {
        const {
          RECEIVE_PAGINATED_ITEM_COUNT,
          RECEIVE_PAGINATED_IDS,
          ADD_PAGINATED_ID,
          REMOVE_PAGINATED_ID,
        } = reducerProps.actions;
        const { reducer } = reducerProps;

        it('should return initial state', () => {
          expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
        });
        describe('handle actions', () => {
          const filterId = 'test';
          describe('RECEIVE_PAGINATED_ITEM_COUNT', () => {
            it('should handle action, initial state', () => {
              const itemCount = 5;
              const nextState = {
                ...INITIAL_STATE,
                [filterId]: { ...INITIAL_SUB_STATE, itemCount },
              };
              expect(reducer(INITIAL_STATE, {
                type: RECEIVE_PAGINATED_ITEM_COUNT, itemCount, filterId,
              }))
                .toEqual(nextState);
            });
            it('should handle action, other state', () => {
              const itemCount = 5;
              const otherState = { [filterId]: { byPagination: {}, itemCount: 30 } };
              const nextState = {
                ...otherState,
                [filterId]: { ...otherState[filterId], itemCount },
              };
              expect(reducer(otherState, {
                type: RECEIVE_PAGINATED_ITEM_COUNT, itemCount, filterId,
              }))
                .toEqual(nextState);
            });
          });
          describe('RECEIVE_PAGINATED_IDS', () => {
            const ids = ['zsergt', '1fdrj', '38hu'];

            it('should handle action, initial state', () => {
              const offset = 10;
              const limit = 3;
              const nextState = {
                ...INITIAL_STATE,
                [filterId]: {
                  ...INITIAL_SUB_STATE,
                  byPagination: {
                    10: ids[0],
                    11: ids[1],
                    12: ids[2],
                  },
                },
              };
              expect(reducer(INITIAL_STATE, {
                type: RECEIVE_PAGINATED_IDS,
                offset,
                limit,
                ids,
                filterId,
              }))
                .toEqual(nextState);
            });
            it('should handle action, other state', () => {
              const otherState = {
                other: {
                  ...INITIAL_SUB_STATE,
                  byPagination: {
                    0: 'sdfr',
                    1: 34,
                    2: 'i44',
                  },
                  itemCount: 6,
                },
                [filterId]: {
                  ...INITIAL_SUB_STATE,
                  byPagination: {
                    0: 'num1',
                    1: 'num2',
                  },
                  itemCount: 2,
                },
              };
              const offset = 3;
              const limit = 3;
              const nextState = {
                ...otherState,
                [filterId]: {
                  ...otherState[filterId],
                  byPagination: {
                    ...otherState[filterId].byPagination,
                    3: ids[0],
                    4: ids[1],
                    5: ids[2],
                  },
                },
              };
              expect(reducer(otherState, {
                type: RECEIVE_PAGINATED_IDS,
                offset,
                limit,
                filterId,
                ids,
              }))
                .toEqual(nextState);
            });
          });
          describe('ADD_PAGINATED_ID', () => {
            const id = 'defrgt7';
            it('should handle action, initial state', () => {
              const nextState = {
                ...INITIAL_STATE,
                [filterId]: {
                  ...INITIAL_SUB_STATE,
                  itemCount: 1,
                  byPagination: {
                    0: id,
                  },
                },
              };
              expect(reducer(INITIAL_STATE, {
                type: ADD_PAGINATED_ID,
                filterId,
                id,
              }))
                .toEqual(nextState);
            });
            it('should handle action, other state', () => {
              const otherState = {
                [filterId]: {
                  byPagination: {
                    0: 'zefrt',
                    1: 'a340',
                    2: 'bef9',
                  },
                  itemCount: 10,
                },
                other: {
                  byPagination: {
                    0: 'Test1',
                    1: 'Test2',
                    2: 'Test3',
                    3: 'Test4',
                  },
                  itemCount: 4,
                },
              };
              const nextState = {
                ...otherState,
                [filterId]: {
                  itemCount: otherState[filterId].itemCount + 1,
                  search: null,
                  byPagination: {
                    0: id,
                    1: otherState[filterId].byPagination[0],
                    2: otherState[filterId].byPagination[1],
                    3: otherState[filterId].byPagination[2],
                  },
                },
              };
              expect(reducer(otherState, {
                type: ADD_PAGINATED_ID,
                filterId,
                id,
              }))
                .toEqual(nextState);
            });
          });
          describe('REMOVE_PAGINATED_ID', () => {
            const id = 'defrgt7';

            it('should handle action, initial state', () => {
              expect(reducer(INITIAL_STATE, {
                type: REMOVE_PAGINATED_ID,
                filterId,
                id,
              }))
                .toEqual(INITIAL_STATE);
            });
            it('should handle action, other state', () => {
              const otherState = {
                [filterId]: {
                  byPagination: {
                    0: 'zef1',
                    1: 'ddef',
                    2: '6Y7',
                    3: id,
                    4: 'ferth',
                  },
                  itemCount: 10,
                },
              };
              const nextState = {
                ...otherState,
                [filterId]: {
                  itemCount: otherState[filterId].itemCount - 1,
                  search: null,
                  byPagination: {
                    0: otherState[filterId].byPagination[0],
                    1: otherState[filterId].byPagination[1],
                    2: otherState[filterId].byPagination[2],
                    3: otherState[filterId].byPagination[4],
                  },
                },
              };
              expect(reducer(otherState, {
                type: REMOVE_PAGINATED_ID,
                search: null,
                filterId,
                id,
              }))
                .toEqual(nextState);
            });
          });
        });
      });
    });
  });
});
