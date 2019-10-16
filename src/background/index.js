
/* global browser */ // eslint-disable-line no-redeclare

const NAME = 'popup';
let port = null;

function connectToBackground() {
  port = browser.runtime.connect({ name: NAME });
}

export async function sendMessage(action, params) {
  return browser.runtime.sendMessage({ action, ...params });
}

export function listenForBackground(cb) {
  if (!port) {
    connectToBackground();
  }
  port.onMessage.addListener(cb);
}

export function stopListenerForBackground(cb) {
  port.onMessage.removeListener(cb);
}
