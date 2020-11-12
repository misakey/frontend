
import log from '@misakey/helpers/log';

export const isAPIAvailable = !(typeof document.addEventListener === 'undefined' || typeof document.visibilityState === 'undefined');

export const listenForVisibilityChanges = (handler) => {
  if (!isAPIAvailable) {
    log('This feature requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
    return;
  }
  document.addEventListener('visibilitychange', handler, false);
  // Safari compatibility https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
  document.addEventListener('pagehide', (event) => {
    if (event.persisted) {
      handler(event);
    }
  }, false);
};

export const stopListeningForVisibilityChanges = (handler) => {
  if (!isAPIAvailable) { return; }
  document.removeEventListener('visibilitychange', handler, false);
};

// if API is unavailable, we consider tab as visible
// to ensure functionality depending on it is working
export const isTabVisible = () => (!isAPIAvailable ? true : document.visibilityState === 'visible');
