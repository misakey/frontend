import parser from 'ua-parser-js';

const userAgent = parser(navigator.userAgent);

export const isDesktopDevice = (userAgent.device.type === undefined);

export const isChrome = (userAgent.engine.name === 'Blink');

export const isFirefox = (userAgent.engine.name === 'Gecko');

export function isTouchable() {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
}
