import { renderHook, act } from '@testing-library/react-hooks';

import usePaginateBoxesByStatus from '.';

// CONSTANTS
const STATUSES = ['open', 'closed'];
const OK = Symbol('OK');
const TIMEOUT = 1000;

const BOXES = [
  { id: 'r1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];
// const makeDelayedReject = (timeout, result = KO) => () => new Promise(
//   (resolve, reject) => setTimeout(() => reject(result), timeout),
// );

// MOCKS
const mockUseSelector = jest.fn();
const mockCountUserBoxesBuilder = jest.fn();
const mockGetUserBoxesBuilder = jest.fn();
const mockHandleHttpErrors = jest.fn();
const mockGetByPagination = jest.fn();
const mockGetBySearchPagination = jest.fn();
const mockGetItemCount = jest.fn();
const mockGetSearch = jest.fn();

jest.mock('react-redux', () => ({
  __esModule: true,
  useDispatch: () => (result) => result,
  useSelector: (...args) => mockUseSelector(...args),
}));

jest.mock('@misakey/hooks/useHandleHttpErrors', () => ({
  __esModule: true,
  ...jest.requireActual('@misakey/hooks/useHandleHttpErrors'),
  default: () => mockHandleHttpErrors,
}));

jest.mock('@misakey/helpers/builder/boxes', () => ({
  __esModule: true,
  ...jest.requireActual('@misakey/helpers/builder/boxes'),
  getUserBoxesBuilder: (...args) => mockGetUserBoxesBuilder(...args),
  countUserBoxesBuilder: (...args) => mockCountUserBoxesBuilder(...args),
}));

jest.mock('store/reducers/userBoxes/pagination', () => ({
  __esModule: true,
  ...jest.requireActual('store/reducers/userBoxes/pagination'),
  selectors: {
    open: {
      getByPagination: (...args) => mockGetByPagination(...args),
      getBySearchPagination: (...args) => mockGetBySearchPagination(...args),
      getItemCount: (...args) => mockGetItemCount(...args),
      getSearch: (...args) => mockGetSearch(...args),
    },
    closed: {
      getByPagination: (...args) => mockGetByPagination(...args),
      getBySearchPagination: (...args) => mockGetBySearchPagination(...args),
      getItemCount: (...args) => mockGetItemCount(...args),
      getSearch: (...args) => mockGetSearch(...args),
    },
  },
}));

// HELPERS
const makeDelayedResolve = (timeout, result = OK) => () => new Promise(
  (resolve) => setTimeout(() => resolve(result), timeout),
);

const initMocks = () => {
  mockUseSelector.mockImplementation((selector) => selector());
  mockCountUserBoxesBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, 10));
  mockGetUserBoxesBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, BOXES));
};
const clearMocks = () => {
  mockUseSelector.mockReset();
  mockCountUserBoxesBuilder.mockReset();
  mockGetUserBoxesBuilder.mockReset();
  mockHandleHttpErrors.mockClear();
  mockGetByPagination.mockReset();
  mockGetItemCount.mockClear();
};

// UNIT TEST
describe('testing usePaginateBoxesByStatus', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    clearMocks();
    initMocks();
    jest.clearAllTimers();
  });

  describe('initialization', () => {
    const STATUS = STATUSES[0];
    const PAYLOAD = ({ statuses: [STATUS] });

    it('should init itemCount', async () => {
      const { result: paginateBoxesByStatus } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(3);

      expect(itemCount).toBeUndefined();

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(PAYLOAD);
    });

    // @FIXME not working because of @testing-library/react-hooks bug
    // Issue: https://github.com/testing-library/react-hooks-testing-library/issues/308
    // it('should handleHttpError on init', async () => {
    //   mockCountUserBoxesBuilder.mockImplementation(makeDelayedReject(TIMEOUT));

    //   const { result: paginateBoxesByStatus, waitForNextUpdate } = renderHook(
    //     ({ status }) => usePaginateBoxesByStatus(status),
    //     {
    //       initialProps: { status: STATUS },
    //     },
    //   );
    //   expect(mockCountUserBoxesBuilder).toHaveBeenCalled();

    //   jest.runAllTimers();
    //   // make sure to await async callback in hook
    //   // await waitForNextUpdate();
    //   expect(paginateBoxesByStatus.error).toBe(KO);
    //   mockCountUserBoxesBuilder.mockReset();
    // });

    it('should return initial values', () => {
      const { result: paginateBoxesByStatus } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      expect(paginateBoxesByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });

    it('should not be impacted by unmount', async () => {
      const { result: paginateBoxesByStatus, unmount, wait } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(3);

      expect(itemCount).toBeUndefined();

      jest.runAllTimers();

      act(() => {
        unmount();
      });

      jest.runAllTimers();
      await wait(() => { }, { timeout: 0 });
      jest.runAllTimers();

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledTimes(1);
      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(PAYLOAD);
      expect(paginateBoxesByStatus.error).toBeUndefined();
    });
  });
  describe('loading more items, item count', () => {
    const STATUS = STATUSES[0];
    const PAYLOAD = ({ statuses: [STATUS] });

    const PARTIAL_BY_PAGINATION = {
      0: 'r1',
    };
    const MISSING_BY_PAGINATION = {
      1: 'r2',
      2: 'r3',
    };
    const BY_PAGINATION = {
      ...PARTIAL_BY_PAGINATION,
      ...MISSING_BY_PAGINATION,
    };

    beforeEach(() => {
      mockGetItemCount.mockImplementation(() => 10);
    });

    afterAll(() => {
      mockGetItemCount.mockReset();
    });

    it('should resolve, all items in store', () => {
      mockGetByPagination.mockImplementation(() => BY_PAGINATION);
      const { result: paginateBoxesByStatus } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      expect(paginateBoxesByStatus.current.loadMoreItems({ offset: 0, limit: 3 }))
        .resolves.toBe(undefined);
    });

    it('should ask more items from API, no item in store', () => {
      mockGetByPagination.mockImplementation(() => ({}));
      const PAGINATION = { offset: 0, limit: 3 };
      const { result: paginateBoxesByStatus } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      paginateBoxesByStatus.current.loadMoreItems(PAGINATION);

      expect(mockGetUserBoxesBuilder).toHaveBeenCalledWith({ ...PAYLOAD, ...PAGINATION });

      jest.runAllTimers();
    });

    it('should ask more items from API, some items in store', () => {
      const PAGINATION = { offset: 0, limit: 3 };
      const MISSING_REQ_IDS = Object.values(MISSING_BY_PAGINATION);
      const MISSING_BOXES = BOXES
        .filter((req) => MISSING_REQ_IDS.includes(req.id));

      mockGetByPagination.mockImplementation(() => PARTIAL_BY_PAGINATION);
      mockGetUserBoxesBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, MISSING_BOXES));

      const expectedPagination = { offset: 1, limit: 2 };

      const { result: paginateBoxesByStatus } = renderHook(
        ({ status, newSearch }) => usePaginateBoxesByStatus(status, newSearch),
        {
          initialProps: { status: STATUS, newSearch: null },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      paginateBoxesByStatus.current.loadMoreItems(PAGINATION);

      expect(mockGetUserBoxesBuilder)
        .toHaveBeenCalledWith({ ...PAYLOAD, ...expectedPagination });

      jest.runAllTimers();
    });
  });

  describe('status change', () => {
    const NEXT_PAYLOAD = ({ statuses: [STATUSES[1]] });

    it('should ask for a new itemCount', () => {
      const { result: paginateBoxesByStatus, rerender } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUSES[0] },
        },
      );

      rerender({ status: STATUSES[1] });

      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(6);

      expect(itemCount).toBeUndefined();

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(NEXT_PAYLOAD);
    });

    it('should not change initial values', () => {
      const { result: paginateBoxesByStatus, rerender } = renderHook(
        ({ status }) => usePaginateBoxesByStatus(status),
        {
          initialProps: { status: STATUSES[0] },
        },
      );

      rerender({ status: STATUSES[1] });

      expect(paginateBoxesByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });
  });
});
