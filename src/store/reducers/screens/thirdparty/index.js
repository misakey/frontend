import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SET_WHITELIST,
  SET_DETECTED_TRACKERS,
  SET_APPS,
} from 'store/actions/screens/thirdparty';

const initialState = { detectedTrackers: [], whitelist: {}, apps: [] };

function setWhitelist(state, { whitelist }) {
  return { ...state, whitelist };
}

function setDetectedTrackers(state, { detectedTrackers }) {
  return { ...state, detectedTrackers };
}

function setApps(state, { apps }) {
  return { ...state, apps };
}

export default createReducer(initialState, {
  [SET_WHITELIST]: setWhitelist,
  [SET_DETECTED_TRACKERS]: setDetectedTrackers,
  [SET_APPS]: setApps,
});
