export function isDesktopDevice() {
  return !(navigator.userAgent.toLowerCase().includes('mobile')
    || navigator.userAgent.toLowerCase().includes('tablet'));
}


export function isChrome() {
  return navigator.userAgent.indexOf('Chrome') !== -1;
}


export function isTouchable() {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
}
