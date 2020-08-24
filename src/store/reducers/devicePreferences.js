import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { UPDATE_MAILER, TOGGLE_DARKMODE } from 'store/actions/devicePreferences';

const initialState = {
  mailer: 'mailto',
  isDarkMode: false,
};

function updateMailer(state, { mailer }) {
  return { ...state, mailer };
}

function toggleDarkmode(state) {
  return { ...state, isDarkMode: !state.isDarkMode };
}

const devicePreferencesReducer = createReducer(initialState, {
  [UPDATE_MAILER]: updateMailer,
  [TOGGLE_DARKMODE]: toggleDarkmode,
});


export default {
  devicePreferences: devicePreferencesReducer,
};
