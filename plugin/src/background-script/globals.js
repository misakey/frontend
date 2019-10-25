import isNil from '@misakey/helpers/isNil';
import get from '@misakey/helpers/get';
import log from '@misakey/helpers/log';
import isString from '@misakey/helpers/isString';
import isEmpty from '@misakey/helpers/isEmpty';
import unionBy from '@misakey/helpers/unionBy';
import groupBy from '@misakey/helpers/groupBy';
import propOr from '@misakey/helpers/propOr';
import parser from 'ua-parser-js';
import { parse } from 'tldts';
import { setItem, getItem } from './storage';
import { getCurrentTab, capitalize } from './utils';
import { APP_URL } from './config';

// HELPERS
const DEFAULT_PURPOSE = 'other';
const getMainPurpose = propOr(DEFAULT_PURPOSE, 'mainPurpose');

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
    this.tabsInfos.set(tabId, []);
    this.counter.delete(tabId);
  }

  getTabInfos(tabId) {
    if (!tabId) { return []; }
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
  updateActiveTrackerCounter(tabId, { reset = false, incr = false } = {}) {
    if (tabId === -1) { return; }

    const newValue = (reset === true ? 0 : this.counter.get(tabId) || 0) + (incr === true ? 1 : 0);
    this.counter.set(tabId, newValue);

    getCurrentTab().then(({ id }) => {
      if (tabId === id) {
        try {
          browser.browserAction.setBadgeText({
            text: `${this.counter.get(tabId) || 0}`,
          });
        } catch (error) { log('Operation non supported on this device.'); }
      }
    });
  }

  /* Helper function used to set in tabInfos the different request detected and if it
  * has been blocked or not according to whitelist or paused state.
  * It also retrieved the known app and purpose associated to the rule that has blocked the request
  */
  updateBlockingInfos({ tabId, url }, rule, blocked = false) {
    const { domain, domainWithoutSuffix } = parse(url);

    const newTabInfos = [...this.getTabInfos(tabId)];
    const data = { blocked, url };

    const mainPurpose = getMainPurpose(rule);
    const name = capitalize(domainWithoutSuffix);
    const app = { id: Date.now(), name, domain, mainPurpose };

    const alreadyDetectedIndex = newTabInfos.findIndex((a) => a.domain === domain);

    // Group scripts detected by mainDomain
    if (alreadyDetectedIndex > -1) {
      const alreadyDetected = { ...newTabInfos[alreadyDetectedIndex] };

      // If the previous script detected has no known category but this one have one
      // we replace the category associated to the tracker
      if (mainPurpose !== DEFAULT_PURPOSE && alreadyDetected.mainPurpose === DEFAULT_PURPOSE) {
        alreadyDetected.mainPurpose = mainPurpose;
        newTabInfos[alreadyDetectedIndex] = alreadyDetected;
        this.tabsInfos.set(tabId, newTabInfos);
        return;
      }
      // The detected script doesn't bring any new information about the app
      if (mainPurpose === DEFAULT_PURPOSE || mainPurpose === alreadyDetected.mainPurpose) {
        return;
      }
    }

    newTabInfos.push({ ...app, detected: [data] });
    this.tabsInfos.set(tabId, newTabInfos);
    this.updateActiveTrackerCounter(tabId, { incr: !blocked });
  }

  getTabInfosForPopup(tabId) {
    return Object.entries(groupBy(this.getTabInfos(tabId), 'mainPurpose'))
      .map(([mainPurpose, apps]) => ({ name: mainPurpose, apps }));
  }

  async convertDetectedTrackersToApps() {
    return getCurrentTab()
      .then(({ id }) => (this.getTabInfos(id).map((app) => ({
        name: app.name,
        id: app.domain,
        mainDomain: app.domain,
        mainPurpose: app.mainPurpose,
        shortDesc: app.domain,
      }))));
  }

  async getAllThirdPartiesApps() {
    if (!this.apps) {
      this.apps = (await (await fetch(APP_URL)).json()).apps;
    }
    const whitelistedApps = (this.whitelist.apps || []).map((domain) => {
      const { domainWithoutSuffix: name } = parse(domain);
      return { id: domain, name: capitalize(name), mainDomain: domain, shortDesc: domain };
    });
    return unionBy(whitelistedApps, this.apps, 'id');
  }

  async getThirdPartyApps(search, mainPurpose, getAllThirdParties = false, limit = 100) {
    let appsFiltered = await (getAllThirdParties
      ? this.getAllThirdPartiesApps()
      : this.convertDetectedTrackersToApps());

    if (isString(search) && !isEmpty(search)) {
      appsFiltered = appsFiltered
        .filter((app) => (app.mainDomain.toLowerCase().includes(search.toLowerCase())));
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

  isRequestWhitelisted(initiatorDomain, targetDomain, mainPurpose) {
    const globalWhitelist = this.whitelist.apps || [];
    const domainWhitelist = get(this.whitelist, ['mainPurposes', initiatorDomain], []);

    const purposeIsWhitelisted = domainWhitelist.includes(mainPurpose);
    const targetDomainIsWhitelisted = globalWhitelist.includes(targetDomain);

    return purposeIsWhitelisted && targetDomainIsWhitelisted;
  }
}

// return the class as a singleton
export default new Globals();
