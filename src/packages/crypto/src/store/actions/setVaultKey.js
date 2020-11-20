import updateBackup from './updateBackup';

import {
  CRYPTO_SET_VAULT_KEY,
} from './types';

export default ({ vaultKey }) => (
  async (dispatch) => {
    await dispatch({
      type: CRYPTO_SET_VAULT_KEY,
      vaultKey,
    });

    await dispatch(updateBackup());
  }
);
