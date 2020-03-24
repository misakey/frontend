import { renderHook, act } from '@testing-library/react-hooks';

import useNotDoneEffect from '.';

// CONSTANTS
const REPEATS = [[1], [2], [3], [4]];

// HELPERS
const fetchFn = jest.fn();

describe('testing useNotDoneEffect', () => {
  beforeEach(() => {
    fetchFn.mockClear();
  });

  test('should call once', async () => {
    const { rerender } = renderHook(
      () => useNotDoneEffect(
        (onDone) => {
          fetchFn();
          onDone();
        },
        [fetchFn],
      ),
      {
        initialProps: { counter: 0 },
      },
    );
    for (let i = 1; i < 10; i++) { // eslint-disable-line no-plusplus
      /* eslint-disable no-await-in-loop */ // rerender sequentially to ensure props change
      await act(async () => {
        rerender({ counter: i });
      });
      /* eslint-enable no-await-in-loop */
    }
    // fetchFn should be called once
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  test.each(REPEATS)('should stop calling after %p repeats', async (times) => {
    const { rerender } = renderHook(
      ({ counter }) => useNotDoneEffect(
        (onDone) => {
          fetchFn();
          if (counter === times) {
            onDone();
          }
        },
        [fetchFn, counter, times],
      ),
      {
        initialProps: { counter: 1 },
      },
    );
    const moreThanTimes = times + 10;
    for (let i = 2; i < moreThanTimes; i++) { // eslint-disable-line no-plusplus
      /* eslint-disable no-await-in-loop */ // rerender sequentially to ensure props change
      await act(async () => {
        rerender({ counter: i });
      });
      /* eslint-enable no-await-in-loop */
    }
    // fetchFn should be called exactly `times`
    expect(fetchFn).toHaveBeenCalledTimes(times);
  });
});
