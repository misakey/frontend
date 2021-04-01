import clipboardRead from '@misakey/core/helpers/clipboard/read';
import isFunction from '@misakey/core/helpers/isFunction';

import { useCallback, useEffect } from 'react';

// HOOKS
export default ({ target = window, onPaste, onError } = {}) => {
  const handlePaste = useCallback(
    async (e) => {
      try {
        const clipboardItems = await clipboardRead(e);
        if (isFunction(onPaste)) {
          onPaste(clipboardItems);
        }
      } catch (err) {
        onError(err);
      }
    },
    [onPaste, onError],
  );

  useEffect(
    () => {
      target.addEventListener('paste', handlePaste);
      return () => {
        target.removeEventListener('paste', handlePaste);
      };
    },
    [target, handlePaste],
  );
};
