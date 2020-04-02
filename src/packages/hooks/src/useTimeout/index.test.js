import { renderHook } from '@testing-library/react-hooks';

import useTimeout from '.';

// CONSTANTS
const DELAYS = [
  [1],
  [10],
  [100],
  [1000],
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

describe('testing useTimeout', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    callback.mockClear();
  });

  test('should call after timeout', () => {
    renderHook(
      () => useTimeout(callback),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should call with default delay, no options', () => {
    renderHook(
      () => useTimeout(callback),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test.each(NOT_NUMBER_DELAYS)('should call with default delay, option delay %p', (delay) => {
    renderHook(
      () => useTimeout(callback, { delay }),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  describe('should call in next cycle', () => {
    test('option: delay 0', () => {
      const ZERO_DELAY = 0;

      renderHook(
        () => useTimeout(callback, { delay: ZERO_DELAY }),
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(ZERO_DELAY);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('option: immediate run', () => {
      renderHook(
        () => useTimeout(callback, { immediateRun: true }),
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(0);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  test.each(DELAYS)('should call after delay', (delay) => {
    renderHook(
      () => useTimeout(callback, { delay }),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(delay);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  describe('effects', () => {
    test('should reset timer when delay changes', () => {
      const DELAY = 4;
      const LONGER_DELAY = 7;

      const { rerender } = renderHook(
        ({ delay }) => useTimeout(callback, { delay }),
        {
          delay: DELAY,
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(DELAY - 1);

      rerender({ delay: LONGER_DELAY });

      jest.advanceTimersByTime(1);

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(LONGER_DELAY);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should reset timer to 0 when immediateRun becomes true', () => {
      const DELAY = 1000;
      const IMMEDIATE_RUN = false;

      const { rerender } = renderHook(
        ({ immediateRun }) => useTimeout(callback, { immediateRun }),
        {
          immediateRun: IMMEDIATE_RUN,
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(DELAY - 1);

      rerender({ immediateRun: !IMMEDIATE_RUN });

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(0);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should reset timer when effects change', () => {
      const EFFECT = [false, true];
      const DELAY = 1000;

      const { rerender } = renderHook(
        ({ effect }) => useTimeout(callback, {}, effect),
        {
          effect: EFFECT[0],
        },
      );

      expect(callback).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(DELAY - 1);

      rerender({ effect: EFFECT[1] });

      jest.advanceTimersByTime(1);

      expect(callback).toHaveBeenCalledTimes(0);

      jest.runAllTimers();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
