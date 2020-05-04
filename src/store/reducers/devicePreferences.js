import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { UPDATE_MAILER } from 'store/actions/devicePreferences';

const initialState = {
  mailer: 'mailto',
};

function updateMailer(state, { mailer }) {
  return { ...state, mailer };
}

const devicePreferencesReducer = createReducer(initialState, {
  [UPDATE_MAILER]: updateMailer,
});


export default {
  devicePreferences: devicePreferencesReducer,
};
