import { useState, useMemo, useCallback, useEffect } from 'react';

import eventGetFile from '@misakey/helpers/event/getFile';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import debounce from '@misakey/helpers/debounce';
import assocPathTargetOrCurrentTarget from '@misakey/helpers/event/targetOrCurrentTarget/assocPath';

// CONSTANTS
const FILE_READER = new FileReader();
let CHANGE_EVENT;

const PROGRESS_MAX = 100;

// HELPERS
const computeProgress = ({ loaded, total }) => (loaded / total) * PROGRESS_MAX;

const storeChangeEvent = (changeEvent, file) => {
  CHANGE_EVENT = assocPathTargetOrCurrentTarget(['value'], file, changeEvent);
  CHANGE_EVENT.persist();
};

const eventMatchFile = (event, { name }) => {
  const { name: eventFileName } = eventGetFile(event);
  return name === eventFileName;
};

// HOOKS
const useEndProgress = (setProgress) => useMemo(
  () => debounce(() => setProgress(undefined)), [setProgress],
);

const useOnLoadStart = (setProgress, onLoadStart) => useCallback((event) => {
  setProgress(0);
  if (isFunction(onLoadStart)) {
    onLoadStart(event);
  }
}, [setProgress, onLoadStart]);

const useOnProgress = (setProgress, onProgress) => useCallback((event) => {
  setProgress(computeProgress(event));
  if (isFunction(onProgress)) {
    onProgress(event);
  }
}, [onProgress, setProgress]);

const useOnClearProgress = (setProgress) => useCallback(
  () => {
    setProgress(undefined);
  }, [setProgress],
);

const useOnReset = (setFile, setPreview) => useCallback(
  () => {
    setFile(undefined);
    setPreview(undefined);
  },
  [setFile, setPreview],
);


export default ({ onLoadStart, onProgress, onLoad, onError }) => {
  const [progress, setProgress] = useState();
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();

  const endProgress = useEndProgress(setProgress);

  const handleLoadStart = useOnLoadStart(setProgress, onLoadStart);
  const handleProgress = useOnProgress(setProgress, onProgress);

  const handleLoad = useCallback(
    () => {
      const { result } = FILE_READER;
      setPreview(result);
      endProgress();
      if (!isNil(CHANGE_EVENT) && eventMatchFile(CHANGE_EVENT, file)) {
        onLoad(CHANGE_EVENT, { file, preview: result });
      }
    }, [endProgress, file, onLoad],
  );

  const handleFileError = useCallback((event) => {
    if (isFunction(onError)) {
      onError(event);
    }
  }, [onError]);

  const onClearProgress = useOnClearProgress(setProgress);
  const onChange = useCallback(
    (event) => {
      const eventFile = eventGetFile(event);
      storeChangeEvent(event, eventFile);
      if (!isNil(eventFile)) {
        setFile(eventFile);
        FILE_READER.readAsDataURL(eventFile);
      }
    },
    [setFile],
  );

  const onReset = useOnReset(setFile, setPreview);

  useEffect(
    () => {
      FILE_READER.onloadstart = handleLoadStart;
      FILE_READER.onprogress = handleProgress;
      FILE_READER.onload = handleLoad;
      FILE_READER.onerror = handleFileError;
    },
    [handleFileError, handleLoad, handleLoadStart, handleProgress],
  );

  return [{ file, preview, progress }, { onChange, onClearProgress, onReset }];
};
