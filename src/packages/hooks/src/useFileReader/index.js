import { useState, useMemo, useCallback } from 'react';

import eventGetFile from '@misakey/helpers/event/getFile';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import debounce from '@misakey/helpers/debounce';

// CONSTANTS
const FILE_READER = new FileReader();
const PROGRESS_MAX = 100;

// HELPERS
const computeProgress = ({ loaded, total }) => (loaded / total) * PROGRESS_MAX;
// HOOKS
const useEndProgress = (setProgress) => useMemo(
  () => debounce(() => setProgress(undefined)), [setProgress],
);

const useOnLoadStart = (setProgress, onLoadStart) => useCallback(() => (event) => {
  setProgress(0);
  if (isFunction(onLoadStart)) {
    onLoadStart(event);
  }
}, [setProgress, onLoadStart]);

const useOnProgress = (setProgress, onProgress) => useCallback(() => (event) => {
  setProgress(computeProgress(event));
  if (isFunction(onProgress)) {
    onProgress(event);
  }
}, [onProgress, setProgress]);

const useOnLoad = (setFile, setPreview, endProgress, onLoad) => useCallback((file) => (event) => {
  setFile(file);
  const preview = FILE_READER.result;
  setPreview(preview);
  if (isFunction(onLoad)) {
    onLoad(event);
  }
  endProgress();
}, [setFile, setPreview, onLoad, endProgress]);

const useOnError = (onError) => useCallback((file) => (event) => {
  if (isFunction(onError)) {
    onError({ file, event });
  }
}, [onError]);

const useOnChange = (
  handleLoadStart, handleProgress, handleLoad, handleFileError,
) => useCallback((event) => {
  const file = eventGetFile(event);
  if (!isNil(file)) {
    FILE_READER.onloadstart = handleLoadStart(file);
    FILE_READER.onprogress = handleProgress(file);
    FILE_READER.onload = handleLoad(file);
    FILE_READER.onerror = handleFileError(file);

    FILE_READER.readAsDataURL(file);
  }
}, [handleLoadStart, handleProgress, handleLoad, handleFileError]);

const useOnClearProgress = (setProgress) => useCallback(
  () => {
    setProgress(undefined);
  }, [setProgress],
);


export default ({ onLoadStart, onProgress, onLoad, onError }) => {
  const [progress, setProgress] = useState();
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();

  const endProgress = useEndProgress(setProgress);

  const handleLoadStart = useOnLoadStart(setProgress, onLoadStart);
  const handleProgress = useOnProgress(setProgress, onProgress);
  const handleLoad = useOnLoad(setFile, setPreview, endProgress, onLoad);
  const handleFileError = useOnError(onError);

  const onClearProgress = useOnClearProgress(setProgress);
  const onChange = useOnChange(handleLoadStart, handleProgress, handleLoad, handleFileError);

  return [{ file, preview, progress }, { onChange, onClearProgress }];
};
