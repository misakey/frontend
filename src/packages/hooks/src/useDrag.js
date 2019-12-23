import { useState, useCallback } from 'react';

// HOOKS
const useOnDragEnter = (setDragActive) => useCallback(() => {
  setDragActive(true);
}, [setDragActive]);

const useOnDragLeave = (setDragActive) => useCallback(() => {
  setDragActive(false);
}, [setDragActive]);

const useOnDrop = (setDragActive) => useCallback(() => {
  setDragActive(false);
}, [setDragActive]);

export default () => {
  const [dragActive, setDragActive] = useState(false);

  const onDragEnter = useOnDragEnter(setDragActive);
  const onDragLeave = useOnDragLeave(setDragActive);
  const onDrop = useOnDrop(setDragActive);

  return [dragActive, { onDragEnter, onDragLeave, onDrop }];
};
