import isNil from '@misakey/helpers/isNil';
import get from '@misakey/helpers/get';
import log from '@misakey/helpers/log';
import parser from 'ua-parser-js';
import { parse } from 'tldts';
import { setItem, getItem } from './storage';
import { getCurrentTab } from './utils';
import { APP_URL } from './config';

const DEFAULT_CATEGORY = 'other';

/**
 * Structure which holds parameters to be used throughout the code, a.k.a. global values.
 * Most of them (but not all) are const.
 */
class Globals {
  constructor() {
    this.BROWSER_INFOS = {};
    this.rules = {};

    this.tabsInfos = new Map();
    this.tabsInitiator = new Map();
    this.counter = new Map();

    this.pausedBlocking = false;
    this.pausedTime = null;

    this.popupOpened = null;
    this.getWhitelist();
    this.getBrowserInfo();
  }

  async getWhitelist() {
    const { whitelist } = await getItem('whitelist');
    this.whitelist = whitelist || [];
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

  getRuleIdByFilter(filter) {
    const result = Object.values(this.rules).findIndex((rule) => rule.pattern === filter);
    return result !== -1 ? Object.keys(this.rules)[result] : null;
  }

  initTabInfos(tabId) {
    this.tabsInfos.set(tabId, {});
  }

  getTabInfos(tabId) {
    if (!this.tabsInfos.has(tabId)) {
      this.initTabInfos(tabId);
    }
    return this.tabsInfos.get(tabId);
  }

  removeTabsInfos(tabId) {
    this.counter.delete(tabId);
    this.tabsInfos.delete(tabId);
    this.tabsInitiator.delete(tabId);
  }

  /* Helper function used to both reset, increment and show the current value of
  * the blocked requests counter for a given tabId.
  */
  updateBlockedCounter(tabId, { reset = false, incr = false } = {}) {
    if (tabId === -1) { return; }

    const newValue = (reset === true ? 0 : this.counter.get(tabId) || 0) + (incr === true ? 1 : 0);
    this.counter.set(tabId, newValue);

    getCurrentTab().then((tab) => {
      if (tab && tab.id === tabId) {
        try {
          browser.browserAction.setBadgeText({
            text: `${this.counter.get(tabId) || 0}`,
          });
        } catch (error) { log('Non supported operation'); }
      }
    });
  }

  /* Helper function used to set in tabInfos the different request detected and if it
  * has been blocked or not according to whitelist or paused state.
  * It also retrieved the known app and category associated to the rule that has blocked the request
  */
  updateBlockingInfos({ tabId, url, type }, rule, blocked = false) {
    // Reset tab infos in case of reload of url changes
    if (type === 'main_frame') {
      this.initTabInfos(tabId);
    }

    this.updateBlockedCounter(tabId, {
      incr: blocked,
      reset: type === 'main_frame',
    });

    if (!rule) { return; } // It was a request with no rule associated in our db

    const { hostname, domainWithoutSuffix } = parse(url);

    const tabInfos = this.getTabInfos(tabId);
    const data = { blocked, count: 1, url };

    const category = (rule && rule.category) || DEFAULT_CATEGORY;
    const app = {
      id: Date.now(),
      name: `${domainWithoutSuffix.charAt(0).toUpperCase()}${domainWithoutSuffix.slice(1)}`,
      domain: hostname,
      category,
    };

    if (!tabInfos[category]) {
      tabInfos[category] = [];
    }

    const position = tabInfos[category].findIndex((a) => a.domain === hostname);

    if (position > -1) {
      const alreadyDetected = tabInfos[category][position].detected
        .findIndex((d) => d.url === data.url);
      if (alreadyDetected > -1) {
        tabInfos[category][position].detected[alreadyDetected].count += 1;
      } else {
        tabInfos[category][position].detected.push(data);
      }
    } else {
      tabInfos[category].push({ ...app, detected: [data] });
    }

    this.tabsInfos.set(tabId, tabInfos);
  }

  getTabInfosForPopup(tabId) {
    return Object.entries(this.getTabInfos(tabId))
      .map(([category, apps]) => ({ name: category, apps }));
  }

  async getThirdPartyApps(search, mainPurpose, getAllThirdParties = false, limit = 100) {
    let appsFiltered = [];
    if (getAllThirdParties) {
      if (!this.apps) {
        this.apps = (await (await fetch(APP_URL)).json()).apps;
      }
      appsFiltered = this.apps.map((app) => ({ ...app, id: app.mainDomain }));
    } else {
      appsFiltered = await getCurrentTab()
        .then((tab) => Object.values(this.getTabInfos(tab.id)).reduce((total, detectedApps) => [
          ...total,
          ...detectedApps.map((app) => ({
            name: app.name,
            id: app.domain,
            mainDomain: app.domain,
            mainPurpose: app.category,
            shortDesc: app.domain,
          })),
        ], []));
    }

    if (search) {
      appsFiltered = appsFiltered.filter((app) => (app.mainDomain.includes(search)));
    }

    if (mainPurpose) {
      appsFiltered = appsFiltered.filter((app) => (app.mainPurpose === mainPurpose));
    }

    return getAllThirdParties ? appsFiltered.slice(0, limit) : appsFiltered;
  }

  /**
   * Helper function used to pause the blocker
   * it can take a time argument (optional) in milliseconds
   */
  async onPauseBlocker(time) {
    this.pausedBlocking = !this.pausedBlocking;

    if (time) {
      this.pausedBlocking = true;
      this.pausedTime = time;
      // handle clearing of a previous timeout to reset a new timeout and avoid collision
      if (!isNil(this.pausedTimeout)) { clearTimeout(this.pausedTimeout); }

      this.pausedTimeout = setTimeout(() => {
        this.pausedBlocking = false;
        this.pausedTime = null;
      }, time - Date.now());
    } else if (this.pausedTime && !this.pausedBlocking) {
      this.pausedTime = null;
    }

    return { paused: this.pausedBlocking, pausedTime: this.pausedTime };
  }

  updateWhitelist(whitelist) {
    this.whitelist = whitelist;
    return setItem('whitelist', this.whitelist);
  }

  requestIsWhitelisted({ url, tabId, initiator, originUrl }, rule) {
    const initiatorUrl = this.tabsInitiator.get(tabId) || originUrl || initiator;
    const { hostname: targetDomain } = parse(url);
    const { domain: initiatorDomain } = parse(initiatorUrl);
    const category = (rule && rule.category) || DEFAULT_CATEGORY;

    const globalWhitelist = this.whitelist.apps || [];
    const domainWhitelist = get(this.whitelist, ['categories', initiatorDomain], []);

    const categoryIsWhitelisted = domainWhitelist.includes(category);
    const targetDomainIsWhitelisted = globalWhitelist.includes(targetDomain);

    return categoryIsWhitelisted && targetDomainIsWhitelisted;
  }
}

// return the class as a singleton
export default new Globals();
