
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import {
  AUTH_SECLEVEL_WARNING_HIDE,
  AUTH_SECLEVEL_WARNING_SHOW,
  PLUGIN_REFRESH_WARNING_SHOW,
  PLUGIN_REFRESH_WARNING_HIDE,
} from 'store/actions/warning';

const initialState = {
  seclevelWarningShow: false,
  requiredSeclevel: null,
  displayPluginRefreshWarning: false,
};

function showAuthSeclevelWarning(state, { requiredSeclevel }) {
  return { ...state, seclevelWarningShow: true, requiredSeclevel };
}
function hideAuthSeclevelWarning(state) {
  return { ...state, seclevelWarningShow: false, requiredSeclevel: null };
}

function showPluginRefreshWarning(state) {
  return { ...state, displayPluginRefreshWarning: true };
}
function hidePluginRefreshWarning(state) {
  return { ...state, displayPluginRefreshWarning: false };
}

export default createReducer(initialState, {
  [AUTH_SECLEVEL_WARNING_HIDE]: hideAuthSeclevelWarning,
  [AUTH_SECLEVEL_WARNING_SHOW]: showAuthSeclevelWarning,

  [PLUGIN_REFRESH_WARNING_SHOW]: showPluginRefreshWarning,
  [PLUGIN_REFRESH_WARNING_HIDE]: hidePluginRefreshWarning,
});
