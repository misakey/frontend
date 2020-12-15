import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { UPDATE_MAILER, TOGGLE_DARKMODE, INIT_DARKMODE } from 'store/actions/devicePreferences';
import { createSelector } from 'reselect';


const initialState = {
  mailer: 'mailto',
  isDarkMode: null,
};

function updateMailer(state, { mailer }) {
  return { ...state, mailer };
}

function toggleDarkmode(state) {
  return { ...state, isDarkMode: !state.isDarkMode };
}

const initDarkMode = (state, { isDarkMode }) => ({ ...state, isDarkMode });

const getState = (state) => state.devicePreferences;

const getIsDarkMode = createSelector(
  getState,
  (state) => state.isDarkMode,
);

export const selectors = {
  getIsDarkMode,
};


const devicePreferencesReducer = createReducer(initialState, {
  [UPDATE_MAILER]: updateMailer,
  [INIT_DARKMODE]: initDarkMode,
  [TOGGLE_DARKMODE]: toggleDarkmode,
});

export default {
  devicePreferences: devicePreferencesReducer,
};
