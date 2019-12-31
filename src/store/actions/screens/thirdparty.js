export const SET_DETECTED_TRACKERS = Symbol('SET_DETECTED_TRACKERS');
export const SET_WHITELISTED_DOMAINS = Symbol('SET_WHITELISTED_DOMAINS');
export const SET_APPS = Symbol('SET_APPS');
export const TOGGLE_WHITELIST_FOR_APP = Symbol('TOGGLE_WHITELIST_FOR_APP');

export function setDetectedTrackers(detectedTrackers) {
  return {
    type: SET_DETECTED_TRACKERS,
    detectedTrackers,
  };
}

export function setWhitelist(whitelistedDomains) {
  return {
    type: SET_WHITELISTED_DOMAINS,
    whitelistedDomains,
  };
}

export function setApps(apps) {
  return {
    type: SET_APPS,
    apps,
  };
}

export function toggleWhitelistForApp(mainDomain, listKey) {
  return {
    type: TOGGLE_WHITELIST_FOR_APP,
    mainDomain,
    listKey,
  };
}
