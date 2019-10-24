export const SET_DETECTED_TRACKERS = Symbol('SET_DETECTED_TRACKERS');
export const SET_WHITELIST = Symbol('SET_WHITELIST');
export const SET_APPS = Symbol('SET_APPS');
export const TOGGLE_WHITELIST_FOR_APP = Symbol('TOGGLE_WHITELIST_FOR_APP');

export function setDetectedTrackers(detectedTrackers) {
  return {
    type: SET_DETECTED_TRACKERS,
    detectedTrackers,
  };
}

export function setWhitelist(whitelist) {
  return {
    type: SET_WHITELIST,
    whitelist,
  };
}

export function setApps(apps) {
  return {
    type: SET_APPS,
    apps,
  };
}

export function toggleWhitelistForApp(appId, listKey) {
  return {
    type: TOGGLE_WHITELIST_FOR_APP,
    appId,
    listKey,
  };
}
