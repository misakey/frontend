import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SET_WHITELISTED_DOMAINS,
  SET_DETECTED_TRACKERS,
  SET_APPS,
  TOGGLE_WHITELIST_FOR_APP,
} from 'store/actions/screens/thirdparty';

const initialState = {
  detectedTrackers: [],
  whitelistedDomains: [],
  apps: { whitelisted: [], blocked: [] },
};

function setWhitelistedDomains(state, { whitelistedDomains }) {
  return { ...state, whitelistedDomains };
}

function setDetectedTrackers(state, { detectedTrackers }) {
  return { ...state, detectedTrackers };
}

function setApps(state, { apps }) {
  return { ...state, apps };
}

function toggleWhitelistForApp(state, { mainDomain, listKey }) {
  const newList = [...state.apps[listKey]];
  const targetIndex = newList.findIndex((app) => app.mainDomain === mainDomain);
  newList[targetIndex].whitelisted = !newList[targetIndex].whitelisted;
  return { ...state, apps: { ...state.apps, [listKey]: newList } };
}


export default createReducer(initialState, {
  [SET_WHITELISTED_DOMAINS]: setWhitelistedDomains,
  [SET_DETECTED_TRACKERS]: setDetectedTrackers,
  [TOGGLE_WHITELIST_FOR_APP]: toggleWhitelistForApp,
  [SET_APPS]: setApps,
});
