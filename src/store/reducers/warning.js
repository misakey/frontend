
import createReducer from '@misakey/store/reducers/helpers/createReducer';
import {
  AUTH_SECLEVEL_WARNING_HIDE,
  AUTH_SECLEVEL_WARNING_SHOW,
} from 'store/actions/warning';

const initialState = {
  seclevelWarningShow: false,
  requiredSeclevel: null,
};

function showAuthSeclevelWarning(state, { requiredSeclevel }) {
  return { ...state, seclevelWarningShow: true, requiredSeclevel };
}
function hideAuthSeclevelWarning(state) {
  return { ...state, seclevelWarningShow: false, requiredSeclevel: null };
}

export default createReducer(initialState, {
  [AUTH_SECLEVEL_WARNING_HIDE]: hideAuthSeclevelWarning,
  [AUTH_SECLEVEL_WARNING_SHOW]: showAuthSeclevelWarning,
});
