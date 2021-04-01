import { useEffect, useMemo, useCallback } from 'react';

import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import any from '@misakey/core/helpers/any';
import propEq from '@misakey/core/helpers/propEq';
import noop from '@misakey/core/helpers/noop';
import remove from '@misakey/core/helpers/remove';

// CONSTANTS
const LOADING_SCRIPTS = [];
const LOADED_SCRIPTS = [];

// HELPERS
const hasSameSrcThan = propEq('src');
const isInScriptList = (src, scriptList) => any(hasSameSrcThan(src))(scriptList);
// HOOKS
const useAddLoadedScript = () => useCallback(
  (script) => {
    remove(LOADING_SCRIPTS, hasSameSrcThan(script.src));
    if (!isInScriptList(script.src, LOADED_SCRIPTS)) {
      LOADED_SCRIPTS.push(script);
    }
  },
  [],
);

const useAlreadyLoadedScript = (src, onAlreadyLoaded) => useEffect(
  () => {
    if (!isNil(src)) {
      const isLoaded = isInScriptList(src, LOADED_SCRIPTS);
      if (isLoaded) {
        onAlreadyLoaded();
      }
    }
  },
  [src, onAlreadyLoaded],
);

const useScript = (
  src, onload, addLoadingScript, addLoadedScript, onScriptError,
) => useEffect(
  () => {
    if (isNil(src)) { return noop; }

    const isLoading = isInScriptList(src, LOADING_SCRIPTS);
    if (isLoading) { return noop; }

    const isLoaded = isInScriptList(src, LOADED_SCRIPTS);
    if (isLoaded) { return noop; }
    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (isNil(existingScript)) {
      const script = document.createElement('script');
      script.src = src;


      const onLoadScript = (...args) => {
        onload(...args).then(() => { addLoadedScript(script); });
      };
      script.addEventListener('load', onLoadScript);
      script.addEventListener('error', onScriptError);
      document.body.appendChild(script);
      addLoadingScript(script);
      return () => {
        script.removeEventListener('load', onLoadScript);
        script.removeEventListener('error', onScriptError);
      };
    }
    const onLoadScript = (...args) => {
      onload(...args).then(() => { addLoadedScript(existingScript); });
    };
    existingScript.addEventListener('load', onLoadScript);
    existingScript.addEventListener('error', onScriptError);

    addLoadingScript(existingScript);
    return () => {
      existingScript.removeEventListener('load', onLoadScript);
      existingScript.removeEventListener('error', onScriptError);
    };
  },
  [src, onload, addLoadingScript, addLoadedScript, onScriptError],
);

// @FIXME add to @misakey/hooks
export default (src, onload, onAlreadyLoaded, onError) => {
  const onLoadSafe = useMemo(
    () => (isFunction(onload) ? onload : noop),
    [onload],
  );

  const onAlreadyLoadedSafe = useMemo(
    () => (isFunction(onAlreadyLoaded) ? onAlreadyLoaded : noop),
    [onAlreadyLoaded],
  );

  const addLoadingScript = useCallback(
    (script) => {
      if (!isInScriptList(script, LOADING_SCRIPTS)) {
        LOADING_SCRIPTS.push(script);
      }
    },
    [],
  );
  const addLoadedScript = useAddLoadedScript();

  const onScriptError = useCallback(
    (error) => {
      if (!isFunction(onError)) {
        throw error;
      }
      onError(error);
    },
    [onError],
  );


  useScript(src, onLoadSafe, addLoadingScript, addLoadedScript, onScriptError);
  useAlreadyLoadedScript(src, onAlreadyLoadedSafe);
};
