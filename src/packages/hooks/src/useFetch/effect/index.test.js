import PropTypes from 'prop-types';

import { renderHook, act } from '@testing-library/react-hooks';

import { SnackbarProvider } from 'notistack';

import useFetchEffect from '.';

// MOCKS
jest.mock('../../useHandleGenericHttpErrors/index.js', () => ({
  __esModule: true,
  default: jest.fn(() => (error) => ({ mock: true, error })),
}));

// CONSTANTS
const OK = Symbol('OK');
const ERROR = Symbol('ERROR');

const INITIAL_PROPS = {
  shouldFetch: false,
};

// HELPERS
const fetchFn = jest.fn().mockResolvedValue(OK);
const fecthErrorFn = jest.fn().mockRejectedValue(ERROR);
const makeDelayedFetchFn = (timeout) => jest.fn(() => new Promise(
  (resolve) => setTimeout(() => resolve(OK), timeout),
));

// COMPONENTS
const Wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('testing useFetchEffect', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    fetchFn.mockClear();
    fecthErrorFn.mockClear();
  });

  describe('default behaviour', () => {
    test('should not call fetchFn', () => {
      renderHook(
        (props) => useFetchEffect(fetchFn, props),
        {
          wrapper: Wrapper,
          initialProps: INITIAL_PROPS,
        },
      );

      expect(fetchFn).not.toHaveBeenCalled();
    });

    test.each([[1], [2], [3]])('should call fetchFn %p times', async (times) => {
      const { rerender } = renderHook(
        (props) => useFetchEffect(fetchFn, props),
        {
          wrapper: Wrapper,
          initialProps: INITIAL_PROPS,
        },
      );
      const countToChanges = [...new Array(times * 2 - 1)]
        .map((value, index) => (index % 2 === 0 ? { shouldFetch: true } : { shouldFetch: false }));
      for (let i = 0; i < countToChanges.length; i++) { // eslint-disable-line no-plusplus
        /* eslint-disable no-await-in-loop */ // rerender sequentially to ensure props change
        await act(async () => {
          rerender(countToChanges[i]);
        });
        /* eslint-enable no-await-in-loop */
      }

      expect(fetchFn).toHaveBeenCalledTimes(times);
    });

    test('should call fetchFn only once until fetchFn resolved', async () => {
      const TIMEOUT = 1000;
      const delayedFetchFn = makeDelayedFetchFn(TIMEOUT);
      const { rerender, result, waitForNextUpdate } = renderHook(
        (props) => useFetchEffect(delayedFetchFn, props),
        {
          wrapper: Wrapper,
          initialProps: INITIAL_PROPS,
        },
      );

      await act(async () => {
        rerender({ shouldFetch: true });
      });

      expect(result.current.isFetching).toBe(true);

      await act(async () => {
        rerender({ shouldFetch: false });
      });
      await act(async () => {
        rerender({ shouldFetch: true });
      });

      expect(result.current.isFetching).toBe(true);

      jest.advanceTimersByTime(TIMEOUT);

      await waitForNextUpdate();

      expect(delayedFetchFn).toHaveBeenCalledTimes(1);
      expect(result.current.isFetching).toBe(false);
    });

    test('should call fetchFn once and stopOnError', async () => {
      const { rerender, result } = renderHook(
        (props) => useFetchEffect(fecthErrorFn, props),
        {
          wrapper: Wrapper,
          initialProps: { shouldFetch: false },
        },
      );

      await act(async () => {
        rerender({ shouldFetch: true });
      });

      await act(async () => {
        rerender({ shouldFetch: false });
      });
      await act(async () => {
        rerender({ shouldFetch: true });
      });

      expect(fecthErrorFn).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBe(ERROR);
    });
  });
  describe('fetchOnlyOnce', () => {
    test.each([[1], [2], [3]])('should call fetchFn only once after %p rerender', async (times) => {
      const { rerender } = renderHook(
        (props) => useFetchEffect(fetchFn, props),
        {
          wrapper: Wrapper,
          initialProps: { shouldFetch: false, fetchOnlyOnce: true },
        },
      );
      const countToChanges = [...new Array(times * 2 - 1)]
        .map((value, index) => (index % 2 === 0
          ? { shouldFetch: true, fetchOnlyOnce: true }
          : { shouldFetch: false, fetchOnlyOnce: true }));
      for (let i = 0; i < countToChanges.length; i++) { // eslint-disable-line no-plusplus
        /* eslint-disable no-await-in-loop */ // rerender sequentially to ensure props change
        await act(async () => {
          rerender(countToChanges[i]);
        });
        /* eslint-enable no-await-in-loop */
      }

      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });
  describe('do not stopOnError', () => {
    test('should call fetchFn twice and not stopOnError', async () => {
      const { rerender, result } = renderHook(
        (props) => useFetchEffect(fecthErrorFn, props),
        {
          wrapper: Wrapper,
          initialProps: { shouldFetch: false, stopOnError: false },
        },
      );

      await act(async () => {
        rerender({ shouldFetch: true, stopOnError: false });
      });

      expect(result.current.error).toBe(ERROR);

      await act(async () => {
        rerender({ shouldFetch: false, stopOnError: false });
      });
      await act(async () => {
        rerender({ shouldFetch: true, stopOnError: false });
      });

      expect(fecthErrorFn).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBe(ERROR);
    });
  });
  describe('fetchWhileFetching', () => {
    test('should call fetchFn twice', async () => {
      const TIMEOUT = 1000;
      const delayedFetchFn = makeDelayedFetchFn(TIMEOUT);
      const { rerender, result, waitForNextUpdate } = renderHook(
        (props) => useFetchEffect(delayedFetchFn, props),
        {
          wrapper: Wrapper,
          initialProps: { shouldFetch: false, fetchWhileFetching: true },
        },
      );

      await act(async () => {
        rerender({ shouldFetch: true, fetchWhileFetching: true });
      });

      expect(result.current.isFetching).toBe(true);

      await act(async () => {
        rerender({ shouldFetch: false, fetchWhileFetching: true });
      });
      await act(async () => {
        rerender({ shouldFetch: true, fetchWhileFetching: true });
      });

      expect(result.current.isFetching).toBe(true);

      jest.advanceTimersByTime(TIMEOUT);

      await waitForNextUpdate();

      expect(delayedFetchFn).toHaveBeenCalledTimes(2);
      expect(result.current.isFetching).toBe(false);
    });
  });
});
