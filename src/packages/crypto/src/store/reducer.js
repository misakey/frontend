import {
  CRYPTO_SET_SECRETS,
  CRYPTO_SET_BACKUP_KEY,
} from './actions';

// REDUCERS

const initialState = {
  secrets: {},
};

export default function (currentState = initialState, action) {
  switch (action.type) {
    case CRYPTO_SET_BACKUP_KEY:
      return {
        ...currentState,
        backupKey: action.backupKey,
      };
    case CRYPTO_SET_SECRETS:
      return {
        ...currentState,
        secrets: action.secrets,
      };
    default:
      return currentState;
  }
}
