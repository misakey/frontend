import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isNumber from '@misakey/helpers/isNumber';
import isFunction from '@misakey/helpers/isFunction';

import useInterval from '@misakey/hooks/useInterval';

import Button from '@misakey/ui/Button';

// CONSTANTS
const UNIT = {
  seconds: 'seconds',
  minutes: 'minutes',
  hours: 'hours',
};

const UNITS = Object.values(UNIT);

// values in ms
const INTERVAL_DELAYS = {
  [UNIT.seconds]: 1000,
  [UNIT.minutes]: 1000 * 60,
  [UNIT.hours]: 1000 * 60 * 60,
};

// HELPERS
const getText = (text, counter) => `${text} (${counter})`;

// @FIXME implement a way to fetch updated milestone from backend or store it in browser

// COMPONENTS
const ButtonDisabledDelay = ({
  disabled,
  onClick,
  delay,
  unit,
  text,
  delayedText,
  ...rest
}) => {
  const [counter, setCounter] = useState(null);
  const [textWithDelay, setTextWithDelay] = useState(text);

  const intervalDelay = useMemo(
    () => INTERVAL_DELAYS[unit] || INTERVAL_DELAYS[UNIT.seconds],
    [unit],
  );

  const hasCounter = useMemo(
    () => !isNil(counter),
    [counter],
  );

  const disabledWithDelay = useMemo(
    () => disabled || hasCounter,
    [disabled, hasCounter],
  );

  const textWhenDelayed = useMemo(
    () => (isNil(delayedText) ? text : delayedText),
    [delayedText, text],
  );

  const clearDelay = useCallback(
    () => {
      setCounter(null);
    },
    [],
  );

  const updateCounter = useCallback(
    () => {
      if (!hasCounter) {
        return;
      }
      if (counter > 0) {
        setCounter((prevCounter) => prevCounter - 1);
      } else {
        clearDelay();
      }
    },
    [hasCounter, clearDelay, counter],
  );

  const onClickWithStartDelay = useCallback(
    () => {
      if (isFunction(onClick)) {
        onClick();
      }
      if (isNumber(delay)) {
        // time left is delay - 1 unit
        setCounter(delay - 1);
      }
    },
    [delay, setCounter, onClick],
  );

  useInterval(updateCounter, { delay: intervalDelay, shouldStart: hasCounter });

  useEffect(
    () => {
      if (!hasCounter) {
        setTextWithDelay(text);
      } else {
        const nextText = getText(textWhenDelayed, counter);
        setTextWithDelay(nextText);
      }
    },
    [counter, hasCounter, textWhenDelayed, text],
  );

  return (
    <Button
      disabled={disabledWithDelay}
      onClick={onClickWithStartDelay}
      text={textWithDelay}
      {...rest}
    />
  );
};

ButtonDisabledDelay.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  // delay in unit
  delay: PropTypes.number,
  unit: PropTypes.oneOf(UNITS),
  text: PropTypes.node.isRequired,
  delayedText: PropTypes.node,
};

ButtonDisabledDelay.defaultProps = {
  disabled: false,
  onClick: null,
  delay: window.env.CONFIRM_CODE_TIMEOUT,
  unit: UNIT.seconds,
  delayedText: null,
};

export default ButtonDisabledDelay;
