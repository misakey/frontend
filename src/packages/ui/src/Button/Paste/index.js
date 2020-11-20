import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useFormikContext } from 'formik';

import log from '@misakey/helpers/log';
import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import Button from '@misakey/ui/Button';
import IconButton from '@material-ui/core/IconButton';

import PasteIcon from '@material-ui/icons/Assignment';

// CONSTANTS
const HAS_CLIPBOARD = navigator.clipboard;
const HAS_PASTE = HAS_CLIPBOARD && isFunction(navigator.clipboard.readText);
const EXEC_PASTE_SUPPORT = document.queryCommandSupported('paste');

export const MODE = {
  icon: 'icon',
  text: 'text',
};
export const MODES = Object.values(MODE);

// COMPONENTS
// expects to be child of a Formik Form
const ButtonPaste = ({ mode, field, inputRef, ...props }) => {
  const { setFieldValue } = useFormikContext();

  const { enqueueSnackbar } = useSnackbar();

  const { name } = useMemo(() => field, [field]);

  const isIcon = useMemo(() => mode === MODE.icon, [mode]);

  const ButtonComponent = useMemo(
    () => (isIcon
      ? IconButton
      : Button),
    [isIcon],
  );

  const focusInput = useCallback(
    () => {
      const { current } = inputRef;

      if (!isNil(current)) {
        current.focus();
      }
    },
    [inputRef],
  );

  const execCommandFallback = useCallback(
    () => {
      const { current } = inputRef;

      if (!isNil(current)) {
        current.focus();
        return setTimeout(
          () => { document.execCommand('paste'); },
        );
      }
      return Promise.resolve();
    },
    [inputRef],
  );

  const onTryPaste = useCallback(
    (e) => {
      if (HAS_PASTE) {
        return navigator.clipboard.readText()
          .then((text) => {
            setFieldValue(name, text);
          })
          .catch((error) => {
            const { message } = error;
            enqueueSnackbar(message || `${error}`, { variant: 'warning' });
          });
      }
      return execCommandFallback(e);
    },
    [enqueueSnackbar, name, setFieldValue, execCommandFallback],
  );

  const onButtonClick = useCallback(
    (e) => onTryPaste(e).then(focusInput),
    [onTryPaste, focusInput],
  );

  if (!HAS_PASTE && !EXEC_PASTE_SUPPORT) {
    log('cannot paste: no clipboard API, nor paste fallback');
    return null;
  }

  return (
    <ButtonComponent onClick={onButtonClick} {...props}>
      {isIcon && <PasteIcon />}
    </ButtonComponent>
  );
};

ButtonPaste.propTypes = {
  mode: PropTypes.oneOf(MODES),
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  inputRef: PropTypes.object,
};

ButtonPaste.defaultProps = {
  mode: MODE.icon,
  inputRef: {},
};

export default ButtonPaste;
