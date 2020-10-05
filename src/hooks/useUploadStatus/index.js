import { ENCRYPTION, UPLOAD } from 'constants/upload/status';

import { useReducer, useCallback } from 'react';

// CONSTANTS
const INITIAL_STATE = {};
const RESET = Symbol('RESET');

// HELPERS
const uploadStatusReducer = (state, { key, type, progress }) => {
  if (type === ENCRYPTION) {
    return {
      ...state,
      [key]: { type },
    };
  }
  if (type === UPLOAD) {
    return {
      ...state,
      [key]: { type, progress },
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

  const onDone = useCallback(
    (key) => dispatch({ type: UPLOAD, key, progress: 100 }),
    [dispatch],
  );

  const onReset = useCallback(
    () => dispatch({ type: RESET }),
    [dispatch],
  );

  return [state, { onProgress, onEncrypt, onUpload, onDone, onReset }];
};
