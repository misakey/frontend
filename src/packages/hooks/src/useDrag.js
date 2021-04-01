import { useState, useCallback } from 'react';

import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';

// HOOKS
const useOnDragEnter = (setDragActive, type) => useCallback((e) => {
  if (!isNil(type)) {
    const { dataTransfer: { types: dataTransferTypes } } = e;
    if (dataTransferTypes.includes(type)) {
      e.preventDefault();
      setDragActive(true);
    }
  } else {
    e.preventDefault();
    setDragActive(true);
  }
}, [setDragActive, type]);

const useOnDragLeave = (setDragActive) => useCallback(() => {
  setDragActive(false);
}, [setDragActive]);

const useOnDrop = (setDragActive, handleDrop) => useCallback((e) => {
  setDragActive(false);
  if (isFunction(handleDrop)) {
    handleDrop(e);
  }
}, [setDragActive, handleDrop]);

export default ({ handleDrop, type } = {}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDragEnter = useOnDragEnter(setDragActive, type);
  const onDragLeave = useOnDragLeave(setDragActive);
  const onDrop = useOnDrop(setDragActive, handleDrop);

  return [dragActive, { onDragEnter, onDragLeave, onDrop }];
};
