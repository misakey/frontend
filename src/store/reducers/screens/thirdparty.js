import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SET_WHITELIST,
  SET_DETECTED_TRACKERS,
  SET_APPS,
  TOGGLE_WHITELIST_FOR_APP,
} from 'store/actions/screens/thirdparty';

const initialState = {
  detectedTrackers: [],
  whitelist: {},
  apps: { whitelisted: [], blocked: [] },
};

function setWhitelist(state, { whitelist }) {
  return { ...state, whitelist };
}

function setDetectedTrackers(state, { detectedTrackers }) {
  return { ...state, detectedTrackers };
}

function setApps(state, { apps }) {
  return { ...state, apps };
}

function toggleWhitelistForApp(state, { appId, listKey }) {
  const newList = [...state.apps[listKey]];
  const targetIndex = newList.findIndex((app) => app.id === appId);
  newList[targetIndex].whitelisted = !newList[targetIndex].whitelisted;
  return { ...state, apps: { ...state.apps, [listKey]: newList } };
}

export default createReducer(initialState, {
  [SET_WHITELIST]: setWhitelist,
  [SET_DETECTED_TRACKERS]: setDetectedTrackers,
  [SET_APPS]: setApps,
  [TOGGLE_WHITELIST_FOR_APP]: toggleWhitelistForApp,
});
