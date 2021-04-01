import isObject from '../isObject';

function isIOS() {
  if (!isObject(process) || !isObject(navigator)) { return false; }

  return process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default isIOS;
