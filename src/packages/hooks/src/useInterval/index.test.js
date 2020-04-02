import { renderHook } from '@testing-library/react-hooks';

import useInterval from '.';

// CONSTANTS
const DELAY = 1000;

const DELAYS = [
  [100],
  [1000],
  [10000],
];

const NOT_NUMBER_DELAYS = [
  [undefined],
  [null],
  ['notanumber'],
  [{}],
  [true],
];

// HELPERS
const callback = jest.fn();

describe('testing useInterval', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    callback.mockClear();
  });

  test('should never call if no delay', () => {
    renderHook(
      () => useInterval(callback),
    );

    jest.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });

  test('should call immediately if runAtStart', () => {
    renderHook(
      () => useInterval(callback, { runAtStart: true }),
    );

    expect(callback).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should never call, option shouldStart false', () => {
    renderHook(
      () => useInterval(callback, { delay: DELAY, shouldStart: false }),
    );

    jest.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });

  test.each(NOT_NUMBER_DELAYS)('should never call, option delay %p', (delay) => {
    renderHook(
      () => useInterval(callback, { delay }),
    );

    jest.runAllTimers();

    expect(callback).not.toHaveBeenCalled();
  });

  test('should call at regular interval', () => {
    renderHook(
      () => useInterval(callback, { delay: DELAY }),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(DELAY);

    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(DELAY);

    expect(callback).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(DELAY);

    expect(callback).toHaveBeenCalledTimes(3);

    // NB: 3 times is enough... this is really testing setInterval here
  });

  test.each(DELAYS)('should call after delay %p', (delay) => {
    renderHook(
      () => useInterval(callback, { delay }),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(delay);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test.each(DELAYS)('should call at start and after delay %p', (delay) => {
    renderHook(
      () => useInterval(callback, { delay, runAtStart: true }),
    );

    expect(callback).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(delay);

    expect(callback).toHaveBeenCalledTimes(2);
  });

  describe('effects', () => {
    test('should reset timer when delay changes', () => {
      const SOME = 400;
      const OTHER = 700;

      const { rerender } = renderHook(
        ({ delay }) => useInterval(callback, { delay }),
        {
          delay: SOME,
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(SOME - 1);

      rerender({ delay: OTHER });

      jest.advanceTimersByTime(1);

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(OTHER);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should call immediately when runAtStart becomes true', () => {
      const RUN_AT_START = false;

      const { rerender } = renderHook(
        ({ runAtStart }) => useInterval(callback, { delay: DELAY, runAtStart }),
        {
          runAtStart: RUN_AT_START,
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      rerender({ runAtStart: !RUN_AT_START });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should start interval only when shouldStart becomes true', () => {
      const SHOULD_START = false;

      const { rerender } = renderHook(
        ({ shouldStart }) => useInterval(callback, { delay: DELAY, shouldStart }),
        {
          shouldStart: SHOULD_START,
        },
      );

      jest.runAllTimers();

      expect(callback).toHaveBeenCalledTimes(0);

      rerender({ shouldStart: !SHOULD_START });

      jest.advanceTimersByTime(DELAY);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should reset timer when effects change', () => {
      const EFFECT = [false, true];

      const { rerender } = renderHook(
        ({ effect }) => useInterval(callback, { delay: DELAY }, effect),
        {
          effect: EFFECT[0],
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(DELAY - 1);

      rerender({ effect: EFFECT[1] });

      jest.advanceTimersByTime(1);

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(DELAY);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
