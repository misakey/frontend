import parser from 'ua-parser-js';

/**
 * Structure which holds parameters to be used throughout the code, a.k.a. global values.
 * Most of them (but not all) are const.
 */
class Globals {
  constructor() {
    this.BROWSER_INFOS = {};
    this.getBrowserInfo();
  }

  async getBrowserInfo() {
    const ua = parser(navigator.userAgent);
    const name = ua.browser.name.toLowerCase();
    const version = parseInt(ua.browser.version.toString(), 10); // convert to string for Chrome
    this.BROWSER_INFOS = {
      name,
      version,
    };
  }
}

// return the class as a singleton
export default new Globals();
