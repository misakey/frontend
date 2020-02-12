import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import { isTouchable } from '@misakey/helpers/devices';

const withLongPress = (Component) => {
  const ComponentWithLongPress = ({
    time, disabled, onPress, onLongPress, onTouchStart, onTouchCancel, onTouchMove, onTouchEnd,
    ...props
  }) => {
    const [touch, setTouch] = useState(true);
    const [timeoutVar, setTimeoutVar] = useState(null);
    const [moved, setMoved] = useState(false);
    const [shouldShortPress, setShouldShortPress] = useState(false);

    const longPressed = useCallback(() => {
      setShouldShortPress(false);
      if (isFunction(onLongPress) && moved === false) {
        onLongPress();
      }
    }, [moved, onLongPress]);

    const startTimeout = useCallback(() => {
      if (!isNil(timeoutVar)) { clearTimeout(timeoutVar); }
      setTimeoutVar(setTimeout(longPressed, time));
    }, [longPressed, time, timeoutVar]);

    const cancelTimeout = useCallback(() => {
      clearTimeout(timeoutVar);
    }, [timeoutVar]);

    const handleTouchStart = useCallback((e) => {
      setShouldShortPress(true);
      setMoved(false);
      startTimeout();
      if (isFunction(onTouchStart)) {
        onTouchStart(e);
      }
    }, [onTouchStart, startTimeout]);

    const handleTouchEnd = useCallback((e) => {
      cancelTimeout();
      if (onPress && shouldShortPress && moved === false) {
        onPress();
      }
      if (isFunction(onTouchEnd)) {
        onTouchEnd(e);
      }
    }, [cancelTimeout, moved, onPress, onTouchEnd, shouldShortPress]);

    const handleTouchCancel = useCallback((e) => {
      cancelTimeout();
      if (isFunction(onTouchCancel)) {
        onTouchCancel(e);
      }
    }, [cancelTimeout, onTouchCancel]);

    const handleMove = useCallback((e) => {
      setMoved(true);
      if (isFunction(onTouchMove)) {
        onTouchMove(e);
      }
    }, [onTouchMove]);

    useEffect(() => {
      setTouch(isTouchable());

      return () => { cancelTimeout(); };
    }, [cancelTimeout]);

    if (!touch || disabled) {
      return <Component {...props} />;
    }

    return (
      <Component
        {...props}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleMove}
        onTouchCancel={handleTouchCancel}
      />
    );
  };


  ComponentWithLongPress.propTypes = {
    time: PropTypes.number,
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    onLongPress: PropTypes.func,
    onTouchStart: PropTypes.func,
    onTouchCancel: PropTypes.func,
    onTouchMove: PropTypes.func,
    onTouchEnd: PropTypes.func,
  };

  ComponentWithLongPress.defaultProps = {
    // from Android default long press timeout
    // https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/view/ViewConfiguration.java#68
    time: 500,
    disabled: false,
    onPress: null,
    onLongPress: null,
    onTouchStart: null,
    onTouchCancel: null,
    onTouchMove: null,
    onTouchEnd: null,
  };

  return ComponentWithLongPress;
};

export default withLongPress;
