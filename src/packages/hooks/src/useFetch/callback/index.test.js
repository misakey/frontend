import React from 'react';
import PropTypes from 'prop-types';

import { renderHook, act } from '@testing-library/react-hooks';

import { SnackbarProvider } from 'notistack';

import useFetchCallback from '.';

// MOCKS
jest.mock('../../useHandleGenericHttpErrors/index.js', () => ({
  __esModule: true,
  default: jest.fn(() => (error) => ({ mock: true, error })),
}));

// CONSTANTS
const OK = Symbol('OK');
const ERROR = Symbol('ERROR');

// HELPERS
const noop = () => {};
const fetchFn = () => Promise.resolve(OK);
const fecthErrorFn = () => Promise.reject(ERROR);
const delayedFetchFn = (timeout) => () => new Promise(
  (resolve) => setTimeout(() => resolve(OK), timeout),
);

// COMPONENTS
const Wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('testing useFetchCallback', () => {
  describe('immediate promise resolution', () => {
    test('should return metadata in a pristine state', () => {
      const { result } = renderHook(
        () => useFetchCallback(fetchFn),
        { wrapper: Wrapper },
      );

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBeNull();
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBeUndefined();
    });

    test('should update metadata once wrappedFetch was successful', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fetchFn),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBe(OK);
      expect(error).toBeNull();
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBeUndefined();
    });

    test('should call onSuccess', async () => {
      const onSuccess = jest.fn();
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fetchFn, { onSuccess }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBe(OK);
      expect(error).toBeNull();
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBeUndefined();

      expect(onSuccess).toHaveBeenCalledWith(OK);
    });

    test('should update metadata once wrappedFetch errored', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn, { onError: noop }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);
    });

    test('should call handleGenericHttpErrors', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn),
        { wrapper: Wrapper },
      );

      act(() => {
        expect(result.current.wrappedFetch())
          .resolves
          .toEqual({ mock: true, error: ERROR }); // ensure mock handleGenericHttpsErrors was called
      });
      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);
    });

    test('should throw error', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn, {}, true),
        { wrapper: Wrapper },
      );

      act(() => {
        expect(result.current.wrappedFetch()).rejects.toBe(ERROR);
      });
      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);
    });

    test('should call onError', async () => {
      const onError = jest.fn();
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn, { onError }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);

      expect(onError).toHaveBeenCalledWith(ERROR);
    });

    test('should throw error after calling onError', async () => {
      const onError = jest.fn((err) => { throw err; });
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn, { onError }, true),
        { wrapper: Wrapper },
      );

      act(() => {
        expect(result.current.wrappedFetch()).rejects.toBe(ERROR);
      });
      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);

      expect(onError).toHaveBeenCalledWith(ERROR);
    });

    test('should call handleGenericHttpErrors after calling onError', async () => {
      const onError = jest.fn((err) => { throw err; });
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fecthErrorFn, { onError }),
        { wrapper: Wrapper },
      );

      act(() => {
        expect(result.current.wrappedFetch())
          .resolves
          .toEqual({ mock: true, error: ERROR }); // ensure mock handleGenericHttpsErrors was called
      });
      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBeUndefined();
      expect(error).toBe(ERROR);
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBe(ERROR);

      expect(onError).toHaveBeenCalledWith(ERROR);
    });

    test('should call onFinally', async () => {
      const onFinally = jest.fn();
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(fetchFn, { onFinally }),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      await waitForNextUpdate();

      const {
        data,
        error,
        isFetching,
        wrappedFetch,
        internalFetchingCount,
        internalErrorRef,
      } = result.current;

      expect(data).toBe(OK);
      expect(error).toBeNull();
      expect(isFetching).toBe(false);
      expect(wrappedFetch).toEqual(expect.any(Function));
      expect(internalFetchingCount.current).toBe(0);
      expect(internalErrorRef.current).toBeUndefined();

      expect(onFinally).toHaveBeenCalled();
    });
  });
  describe('delayed promise resolution', () => {
    // @NB: for the moment, our testing library is bugged when trying to combine timers and hooks
    // https://github.com/testing-library/react-hooks-testing-library/issues/241
    // avoid using jest features for timers
    test('should be in fetching state', async () => {
      const TIMEOUT = 1;
      const { result, waitForNextUpdate } = renderHook(
        () => useFetchCallback(delayedFetchFn(TIMEOUT)),
        { wrapper: Wrapper },
      );

      act(() => {
        result.current.wrappedFetch();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.isFetching).toBe(true);
      expect(result.current.wrappedFetch).toEqual(expect.any(Function));
      expect(result.current.internalFetchingCount.current).toBe(1);
      expect(result.current.internalErrorRef.current).toBeUndefined();

      await waitForNextUpdate();
      expect(result.current.data).toBe(OK);
      expect(result.current.error).toBeNull();
      expect(result.current.isFetching).toBe(false);
      expect(result.current.wrappedFetch).toEqual(expect.any(Function));
      expect(result.current.internalFetchingCount.current).toBe(0);
      expect(result.current.internalErrorRef.current).toBeUndefined();
    });

    test('should stay in fetching state if wrappedFetch resolves after unmount', async () => {
      const FETCH_TIMEOUT = 2;
      const WAIT_TIMEOUT = 1;
      const { result, wait, unmount } = renderHook(
        () => useFetchCallback(delayedFetchFn(FETCH_TIMEOUT)),
        { wrapper: Wrapper },
      );

      await act(async () => {
        result.current.wrappedFetch();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.isFetching).toBe(true);
      expect(result.current.wrappedFetch).toEqual(expect.any(Function));
      expect(result.current.internalFetchingCount.current).toBe(1);
      expect(result.current.internalErrorRef.current).toBeUndefined();

      await wait(() => {
        act(() => {
          unmount();
        });
      }, { timeout: WAIT_TIMEOUT });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.isFetching).toBe(true);
      expect(result.current.wrappedFetch).toEqual(expect.any(Function));
      expect(result.current.internalFetchingCount.current).toBe(1);
      expect(result.current.internalErrorRef.current).toBeUndefined();

      await wait(() => {
        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeNull();
        expect(result.current.isFetching).toBe(true);
        expect(result.current.wrappedFetch).toEqual(expect.any(Function));
        expect(result.current.internalFetchingCount.current).toBe(1);
        expect(result.current.internalErrorRef.current).toBeUndefined();
      }, { timeout: FETCH_TIMEOUT });
    });
  });
});
