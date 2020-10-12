import { ENCRYPTION, UPLOAD } from 'constants/upload/status';

import propOr from '@misakey/helpers/propOr';

import { useReducer, useCallback } from 'react';

// CONSTANTS
const INITIAL_STATE = {};
const ABORTABLE = Symbol('ABORTABLE');
const RESET = Symbol('RESET');

// HELPERS
const propOrEmpty = propOr({});

const uploadStatusReducer = (state, { key, type, progress, req }) => {
  const keyState = propOrEmpty(key)(state);
  if (type === ENCRYPTION) {
    return {
      ...state,
      [key]: { ...keyState, type },
    };
  }
  if (type === UPLOAD) {
    return {
      ...state,
      [key]: { ...keyState, type, progress },
    };
  }
  if (type === ABORTABLE) {
    return {
      ...state,
      [key]: { ...keyState, req },
    };
  }
  if (type === RESET) {
    return INITIAL_STATE;
  }
  return state;
};

// HOOKS
export default () => {
  const [state, dispatch] = useReducer(uploadStatusReducer, INITIAL_STATE);

  const onProgress = useCallback(
    (key) => (progress) => dispatch({ type: UPLOAD, key, progress }),
    [dispatch],
  );

  const onEncrypt = useCallback(
    (key) => dispatch({ type: ENCRYPTION, key }),
    [dispatch],
  );

  const onUpload = useCallback(
    (key) => dispatch({ type: UPLOAD, key, progress: 1 }),
    [dispatch],
  );

  const onAbortable = useCallback(
    (key, req) => dispatch({ type: ABORTABLE, key, req }),
    [dispatch],
  );

  const onDone = useCallback(
    (key) => dispatch({ type: UPLOAD, key, progress: 100 }),
    [dispatch],
  );

  const onReset = useCallback(
    () => dispatch({ type: RESET }),
    [dispatch],
  );

  return [state, { onProgress, onEncrypt, onUpload, onDone, onAbortable, onReset }];
};
