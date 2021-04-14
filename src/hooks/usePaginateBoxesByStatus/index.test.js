import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { SnackbarProvider } from 'notistack';
import PropTypes from 'prop-types';

import usePaginateBoxesByStatus from '.';

// CONSTANTS
const ORG_IDS = ['0000', '1111'];
const OK = Symbol('OK');
const TIMEOUT = 1000;

const BOXES = [
  { id: 'r1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'r3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

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

jest.mock('@misakey/core/api/helpers/builder/boxes', () => ({
  __esModule: true,
  ...jest.requireActual('@misakey/core/api/helpers/builder/boxes'),
  getUserBoxesBuilder: (...args) => mockGetUserBoxesBuilder(...args),
  countUserBoxesBuilder: (...args) => mockCountUserBoxesBuilder(...args),
}));

jest.mock('store/reducers/userBoxes/pagination', () => ({
  __esModule: true,
  ...jest.requireActual('store/reducers/userBoxes/pagination'),
  selectors: {
    makeGetByPagination: () => (...args) => mockGetByPagination(...args),
    makeGetBySearchPagination: () => (...args) => mockGetBySearchPagination(...args),
    makeGetItemCount: () => (...args) => mockGetItemCount(...args),
    makeGetSearch: () => (...args) => mockGetSearch(...args),
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

// COMPONENTS
const Wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
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
    const ORG_ID = ORG_IDS[0];
    const PAYLOAD = ({ ownerOrgId: ORG_ID });

    it('should init itemCount', async () => {
      const { result: paginateBoxesByStatus } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId, { ownerOrgId }),
        {
          initialProps: { ownerOrgId: ORG_ID },
          wrapper: Wrapper,
        },
      );
      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalled();

      expect(itemCount).toBeUndefined();

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(PAYLOAD);
    });

    it('should return initial values', () => {
      const { result: paginateBoxesByStatus } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId),
        {
          initialProps: { ownerOrgId: ORG_ID },
          wrapper: Wrapper,
        },
      );
      expect(paginateBoxesByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });

    it('should return initial values, (default org id)', () => {
      const { result: paginateBoxesByStatus } = renderHook(
        () => usePaginateBoxesByStatus(),
        { wrapper: Wrapper },
      );
      expect(paginateBoxesByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });

    it('should not be impacted by unmount', async () => {
      const { result: paginateBoxesByStatus, unmount } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId, { ownerOrgId }),
        {
          initialProps: { ownerOrgId: ORG_ID },
          wrapper: Wrapper,
        },
      );
      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalled();

      expect(itemCount).toBeUndefined();

      act(() => { jest.runAllTimers(); });

      act(() => {
        unmount();
      });

      act(() => { jest.runAllTimers(); });

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledTimes(1);
      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(PAYLOAD);
      expect(paginateBoxesByStatus.error).toBeUndefined();
    });
  });
  describe('loading more items, item count', () => {
    const ORG_ID = ORG_IDS[0];
    const PAYLOAD = ({ ownerOrgId: ORG_ID });

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
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId),
        {
          initialProps: { ownerOrgId: ORG_ID },
          wrapper: Wrapper,
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        expect(paginateBoxesByStatus.current.loadMoreItems({ offset: 0, limit: 3 }))
          .resolves.toBe(undefined);
      });
    });

    it('should ask more items from API, no item in store', () => {
      mockGetByPagination.mockImplementation(() => ({}));
      const PAGINATION = { offset: 0, limit: 3 };
      const { result: paginateBoxesByStatus } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId, { ownerOrgId }),
        {
          initialProps: { ownerOrgId: ORG_ID },
          wrapper: Wrapper,
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        paginateBoxesByStatus.current.loadMoreItems(PAGINATION);
      });

      expect(mockGetUserBoxesBuilder).toHaveBeenCalledWith({ ...PAYLOAD, ...PAGINATION });

      act(() => { jest.runAllTimers(); });
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
        ({ ownerOrgId, newSearch }) => usePaginateBoxesByStatus(
          ownerOrgId,
          { ownerOrgId },
          newSearch,
        ),
        {
          initialProps: { ownerOrgId: ORG_ID, newSearch: null },
          wrapper: Wrapper,
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        paginateBoxesByStatus.current.loadMoreItems(PAGINATION);
      });

      expect(mockGetUserBoxesBuilder)
        .toHaveBeenCalledWith({ ...PAYLOAD, ...expectedPagination });

      act(() => { jest.runAllTimers(); });
    });
  });

  describe('loading more items, no ownerOrgId', () => {
    const PAYLOAD = {};

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
        () => usePaginateBoxesByStatus(),
        { wrapper: Wrapper },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        expect(paginateBoxesByStatus.current.loadMoreItems({ offset: 0, limit: 3 }))
          .resolves.toBe(undefined);
      });
    });

    it('should ask more items from API, no item in store', () => {
      mockGetByPagination.mockImplementation(() => ({}));
      const PAGINATION = { offset: 0, limit: 3 };
      const { result: paginateBoxesByStatus } = renderHook(
        () => usePaginateBoxesByStatus(),
        { wrapper: Wrapper },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        paginateBoxesByStatus.current.loadMoreItems(PAGINATION);
      });

      expect(mockGetUserBoxesBuilder).toHaveBeenCalledWith({ ...PAYLOAD, ...PAGINATION });

      act(() => { jest.runAllTimers(); });
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
        ({ newSearch }) => usePaginateBoxesByStatus(undefined, newSearch),
        {
          initialProps: { newSearch: null },
          wrapper: Wrapper,
        },
      );

      // make sure mocks call each other...
      expect(mockGetByPagination).toHaveBeenCalled();

      act(() => {
        paginateBoxesByStatus.current.loadMoreItems(PAGINATION);
      });

      expect(mockGetUserBoxesBuilder)
        .toHaveBeenCalledWith({ ...PAYLOAD, ...expectedPagination });

      act(() => { jest.runAllTimers(); });
    });
  });

  describe('ownerOrgId change', () => {
    const PAYLOAD = { ownerOrgId: ORG_IDS[0] };
    const NEXT_PAYLOAD = { ownerOrgId: ORG_IDS[1] };

    it('should ask for a new itemCount', () => {
      mockGetItemCount.mockImplementation(() => PAYLOAD.length);
      const { result: paginateBoxesByStatus, rerender } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId, { ownerOrgId }),
        {
          initialProps: PAYLOAD,
          wrapper: Wrapper,
        },
      );
      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(PAYLOAD);

      mockGetItemCount.mockImplementation(() => undefined);
      act(() => {
        rerender(NEXT_PAYLOAD);
      });

      const { itemCount } = paginateBoxesByStatus.current;
      expect(mockUseSelector).toHaveBeenCalled();

      expect(itemCount).toBeUndefined();

      expect(mockCountUserBoxesBuilder).toHaveBeenCalledWith(NEXT_PAYLOAD);
    });

    it('should not change initial values', () => {
      const { result: paginateBoxesByStatus, rerender } = renderHook(
        ({ ownerOrgId }) => usePaginateBoxesByStatus(ownerOrgId),
        {
          initialProps: { ownerOrgId: ORG_IDS[0] },
          wrapper: Wrapper,
        },
      );
      act(() => {
        rerender({ ownerOrgId: ORG_IDS[1] });
      });

      expect(paginateBoxesByStatus.current).toEqual(expect.objectContaining({
        itemCount: undefined,
        byPagination: undefined,
        loadMoreItems: expect.any(Function),
      }));
    });
  });
});
