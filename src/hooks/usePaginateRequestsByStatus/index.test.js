import { renderHook, act } from '@testing-library/react-hooks';

import usePaginateRequestsByStatus from '.';

// CONSTANTS
const STATUSES = ['draft', 'open'];
const OK = Symbol('OK');
const TIMEOUT = 1000;

const APP_BY_ID = {
  p1: { id: 'p1' },
  p2: { id: 'p2' },
  p3: { id: 'p3' },
};
const APPLICATIONS = Object.values(APP_BY_ID);

const REQUESTS = [
  { id: 'r1', producerId: APPLICATIONS[0].id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r2', producerId: APPLICATIONS[1].id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r3', producerId: APPLICATIONS[2].id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];
// const makeDelayedReject = (timeout, result = KO) => () => new Promise(
//   (resolve, reject) => setTimeout(() => reject(result), timeout),
// );

// MOCKS
const mockUseSelector = jest.fn();
const mockCountUserRequestsBuilder = jest.fn();
const mockGetUserRequestsBuilder = jest.fn();
const mockGetApplicationsByIdsBuilder = jest.fn();
const mockHandleHttpErrors = jest.fn();
const mockGetByPagination = jest.fn();
const mockGetItemCount = jest.fn();

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

jest.mock('@misakey/helpers/builder/requests', () => ({
  __esModule: true,
  ...jest.requireActual('@misakey/helpers/builder/requests'),
  getUserRequestsBuilder: (...args) => mockGetUserRequestsBuilder(...args),
  countUserRequestsBuilder: (...args) => mockCountUserRequestsBuilder(...args),
}));

jest.mock('@misakey/helpers/builder/applications', () => ({
  __esModule: true,
  ...jest.requireActual('@misakey/helpers/builder/applications'),
  getApplicationsByIdsBuilder: (...args) => mockGetApplicationsByIdsBuilder(...args),
}));

jest.mock('store/reducers/userRequests/pagination', () => ({
  __esModule: true,
  ...jest.requireActual('store/reducers/userRequests/pagination'),
  selectors: {
    draft: {
      getByPagination: (...args) => mockGetByPagination(...args),
      getItemCount: (...args) => mockGetItemCount(...args),
    },
    open: {
      getByPagination: (...args) => mockGetByPagination(...args),
      getItemCount: (...args) => mockGetItemCount(...args),
    },
  },
}));

// HELPERS
const makeDelayedResolve = (timeout, result = OK) => () => new Promise(
  (resolve) => setTimeout(() => resolve(result), timeout),
);

const initMocks = () => {
  mockUseSelector.mockImplementation((selector) => selector());
  mockCountUserRequestsBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, 10));
  mockGetUserRequestsBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, REQUESTS));
  mockGetApplicationsByIdsBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, APPLICATIONS));
};
const clearMocks = () => {
  mockUseSelector.mockReset();
  mockCountUserRequestsBuilder.mockReset();
  mockGetUserRequestsBuilder.mockReset();
  mockGetApplicationsByIdsBuilder.mockReset();
  mockHandleHttpErrors.mockClear();
  mockGetByPagination.mockReset();
  mockGetItemCount.mockClear();
};

// UNIT TEST
describe('testing usePaginateRequestsByStatus', () => {
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
      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      const { itemCount } = paginateRequestsByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(3);

      expect(itemCount).toBeUndefined();

      expect(mockCountUserRequestsBuilder).toHaveBeenCalledWith(PAYLOAD);
    });

    // @FIXME not working because of @testing-library/react-hooks bug
    // Issue: https://github.com/testing-library/react-hooks-testing-library/issues/308
    // it('should handleHttpError on init', async () => {
    //   mockCountUserRequestsBuilder.mockImplementation(makeDelayedReject(TIMEOUT));

    //   const { result: paginateRequestsByStatus, waitForNextUpdate } = renderHook(
    //     ({ status }) => usePaginateRequestsByStatus(status),
    //     {
    //       initialProps: { status: STATUS },
    //     },
    //   );
    //   expect(mockCountUserRequestsBuilder).toHaveBeenCalled();

    //   jest.runAllTimers();
    //   // make sure to await async callback in hook
    //   // await waitForNextUpdate();
    //   expect(paginateRequestsByStatus.error).toBe(KO);
    //   mockCountUserRequestsBuilder.mockReset();
    // });

    it('should return initial values', () => {
      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      expect(paginateRequestsByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });

    it('should not be impacted by unmount', async () => {
      const { result: paginateRequestsByStatus, unmount, wait } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );
      const { itemCount } = paginateRequestsByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(3);

      expect(itemCount).toBeUndefined();

      jest.runAllTimers();

      act(() => {
        unmount();
      });

      jest.runAllTimers();
      await wait(() => {}, { timeout: 0 });
      jest.runAllTimers();

      expect(mockCountUserRequestsBuilder).toHaveBeenCalledTimes(1);
      expect(mockCountUserRequestsBuilder).toHaveBeenCalledWith(PAYLOAD);
      expect(paginateRequestsByStatus.error).toBeUndefined();
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
    const STATE = {
      entities: {
        applicationsById: APP_BY_ID,
      },
    };

    beforeEach(() => {
      mockGetItemCount.mockImplementation(() => 10);
    });

    afterAll(() => {
      mockGetItemCount.mockReset();
    });

    it('should resolve, all items in store', async () => {
      mockGetByPagination.mockImplementation(() => BY_PAGINATION);
      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      await expect(paginateRequestsByStatus.current.loadMoreItems({ offset: 0, limit: 3 }))
        .resolves.toBe(undefined);

      expect(mockGetApplicationsByIdsBuilder).not.toHaveBeenCalled();
    });

    it('should ask more items from API, no item in store', async () => {
      mockGetByPagination.mockImplementation(() => ({}));
      const PAGINATION = { offset: 0, limit: 3 };
      const expectedAppIds = REQUESTS.map((req) => req.producerId);
      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      const loadMorePromise = paginateRequestsByStatus.current.loadMoreItems(PAGINATION);

      expect(mockGetUserRequestsBuilder).toHaveBeenCalledWith({ ...PAYLOAD, ...PAGINATION });

      jest.runAllTimers();

      await expect(loadMorePromise).resolves.toBeUndefined();

      expect(mockGetApplicationsByIdsBuilder).toHaveBeenCalledWith(expectedAppIds);
    });

    it('should ask more items from API, applications in store', async () => {
      mockGetByPagination.mockImplementation(() => ({}));
      mockUseSelector.mockImplementation((selector) => selector(STATE));

      const PAGINATION = { offset: 0, limit: 3 };
      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      const loadMorePromise = paginateRequestsByStatus.current.loadMoreItems(PAGINATION);

      expect(mockGetUserRequestsBuilder).toHaveBeenCalledWith({ ...PAYLOAD, ...PAGINATION });

      jest.runAllTimers();

      await expect(loadMorePromise).resolves.toBeUndefined();

      expect(mockGetApplicationsByIdsBuilder).not.toHaveBeenCalled();
    });

    it('should ask more items from API, some items in store', async () => {
      const PAGINATION = { offset: 0, limit: 3 };
      const MISSING_REQ_IDS = Object.values(MISSING_BY_PAGINATION);
      const MISSING_REQUESTS = REQUESTS
        .filter((req) => MISSING_REQ_IDS.includes(req.id));

      mockGetByPagination.mockImplementation(() => PARTIAL_BY_PAGINATION);
      mockGetUserRequestsBuilder.mockImplementation(makeDelayedResolve(TIMEOUT, MISSING_REQUESTS));

      const expectedAppIds = MISSING_REQUESTS
        .map((req) => req.producerId);
      const expectedPagination = { offset: 1, limit: 2 };

      const { result: paginateRequestsByStatus } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUS },
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      const loadMorePromise = paginateRequestsByStatus.current.loadMoreItems(PAGINATION);

      expect(mockGetUserRequestsBuilder)
        .toHaveBeenCalledWith({ ...PAYLOAD, ...expectedPagination });

      jest.runAllTimers();

      await expect(loadMorePromise).resolves.toBeUndefined();

      expect(mockGetApplicationsByIdsBuilder).toHaveBeenCalledWith(expectedAppIds);
    });
  });
  describe('status change', () => {
    const NEXT_PAYLOAD = ({ statuses: [STATUSES[1]] });

    it('should ask for a new itemCount', async () => {
      const { result: paginateRequestsByStatus, rerender } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUSES[0] },
        },
      );

      rerender({ status: STATUSES[1] });

      const { itemCount } = paginateRequestsByStatus.current;
      expect(mockUseSelector).toHaveBeenCalledTimes(6);

      expect(itemCount).toBeUndefined();

      expect(mockCountUserRequestsBuilder).toHaveBeenCalledWith(NEXT_PAYLOAD);
    });

    it('should not change initial values', async () => {
      const { result: paginateRequestsByStatus, rerender } = renderHook(
        ({ status }) => usePaginateRequestsByStatus(status),
        {
          initialProps: { status: STATUSES[0] },
        },
      );

      rerender({ status: STATUSES[1] });

      expect(paginateRequestsByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });
  });
});
