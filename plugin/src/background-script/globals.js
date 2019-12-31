import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';
import isEmpty from '@misakey/helpers/isEmpty';
import unionBy from '@misakey/helpers/unionBy';
import groupBy from '@misakey/helpers/groupBy';
import API from '@misakey/api';
import parser from 'ua-parser-js';
import { parse } from 'tldts';
import { setItem, getItem } from './storage';
import { getCurrentTab, mergeArrays, toggleBadgeAndIconOnPaused, filterAppsBy, markAsFetched } from './utils';

// HELPERS
const DEFAULT_PURPOSE = 'other';

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
    this.whitelist = whitelist || { apps: [], appsFormated: [] };
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
  updateBlockingInfos({ tabId, url }, mainPurpose, blocked = false) {
    const { hostname, domainWithoutSuffix } = parse(url);

    const newTabInfos = [...this.getTabInfos(tabId)];
    const app = {
      mainDomain: hostname,
      mainPurpose,
      blocked,
      name: domainWithoutSuffix,
      id: hostname,
    };

    const alreadyDetected = newTabInfos.find((a) => a.mainDomain === hostname);

    // Group scripts detected by mainDomain
    if (!isEmpty(alreadyDetected)) {
      // If the previous script detected has no known category but this one have one
      // we replace the category associated to the tracker
      if (mainPurpose !== DEFAULT_PURPOSE && alreadyDetected.mainPurpose === DEFAULT_PURPOSE) {
        alreadyDetected.mainPurpose = mainPurpose;
        alreadyDetected.blocked = alreadyDetected.blocked || blocked;
        this.tabsInfos.set(tabId, newTabInfos);
        return;
      }
      // The detected script doesn't bring any new information about the app
      if (mainPurpose === DEFAULT_PURPOSE || mainPurpose === alreadyDetected.mainPurpose) {
        return;
      }
    }

    newTabInfos.push(app);
    this.tabsInfos.set(tabId, newTabInfos);
    this.updateActiveTrackerCounter(tabId, { incr: blocked });
  }

  getTabInfosForPopup(tabId) {
    return Object.entries(groupBy(this.getTabInfos(tabId), 'mainPurpose'))
      .map(([mainPurpose, apps]) => ({
        name: mainPurpose,
        apps,
      }));
  }

  async convertDetectedTrackersToApps() {
    return getCurrentTab().then(({ id }) => {
      const detected = this.getTabInfos(id);
      const domainsToFetch = detected.filter((app) => !app.fetched).map((app) => app.mainDomain);
      if (isEmpty(domainsToFetch)) {
        return detected;
      }

      return API.use(API.endpoints.application.find)
        .build(undefined, undefined, {
          main_domains: domainsToFetch.join(),
          include_related_domains: true,
        })
        .send()
        .then((response) => {
          const newTabInfos = mergeArrays(
            markAsFetched(detected, domainsToFetch),
            response.map(objectToCamelCase),
            'mainDomain',
          );
          this.tabsInfos.set(id, newTabInfos);
          return newTabInfos;
        })
        .catch((err) => {
          log(`Fetch application API returned and error in plugin background: ${err}`);
          return detected;
        });
    });
  }

  async convertWhitelistToApps() {
    if (!this.whitelist.apps) { return []; }
    const whitelistFormated = this.whitelist.appsFormated || [];
    const alreadyFetched = whitelistFormated.map((app) => app.mainDomain);
    const domainsToFetch = this.whitelist.apps.filter((app) => !alreadyFetched.includes(app));

    if (isEmpty(domainsToFetch)) {
      return whitelistFormated;
    }
    return API.use(API.endpoints.application.find)
      .build(undefined, undefined, {
        main_domains: domainsToFetch.join(),
        include_related_domains: true,
      })
      .send()
      .then((response) => {
        const newWhitelistFormated = mergeArrays(
          whitelistFormated,
          response.map(objectToCamelCase),
          'mainDomain',
        );
        this.whitelist.appsFormated = newWhitelistFormated;
        return newWhitelistFormated;
      })
      .catch((err) => {
        log(`Fetch application API returned and error in plugin background: ${err}`);
        return mergeArrays(
          whitelistFormated,
          this.whitelist.apps.map((domain) => ({
            mainDomain: domain,
            mainPurpose: 'other',
            name: domain,
            id: domain,
          })),
          'mainDomain',
        );
      });
  }

  async getAllThirdPartiesApps(search, mainPurpose) {
    const query = { is_third_party: true };
    if (mainPurpose) { query.main_purpose = mainPurpose; }
    if (search) { query.search = search; }

    const whitelistedApps = await (this.convertWhitelistToApps());
    const filteredWhitelist = filterAppsBy(search, mainPurpose, whitelistedApps);

    try {
      const apps = (await API.use(API.endpoints.application.find)
        .build(undefined, undefined, query)
        .send()
      ).map(objectToCamelCase);
      return unionBy(filteredWhitelist, apps, 'id');
    } catch (err) {
      log(`Fetch application API returned and error in plugin background: ${err}`);
      return filteredWhitelist;
    }
  }

  async getThirdPartyApps(search, mainPurpose) {
    const apps = await (this.convertDetectedTrackersToApps());
    return filterAppsBy(search, mainPurpose, apps);
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

      const globals = this;

      this.pausedTimeout = setTimeout(() => {
        globals.pausedBlocking = false;
        globals.pausedTime = null;
        toggleBadgeAndIconOnPaused(this.pausedBlocking);
      }, time - Date.now());
    } else if (this.pausedTime && !this.pausedBlocking) {
      this.pausedTime = null;
    }
    toggleBadgeAndIconOnPaused(this.pausedBlocking);

    return { paused: this.pausedBlocking, pausedTime: this.pausedTime };
  }

  updateWhitelist(whitelist) {
    this.whitelist = whitelist;
    return setItem('whitelist', this.whitelist);
  }

  isRequestWhitelisted(targetDomain) {
    const globalWhitelist = this.whitelist.apps || [];
    return globalWhitelist.includes(targetDomain);
  }
}

// return the class as a singleton
export default new Globals();
