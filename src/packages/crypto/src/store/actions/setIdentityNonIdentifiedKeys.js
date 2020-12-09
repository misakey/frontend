import {
  CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS,
} from './types';

import updateBackup from './updateBackup';

export default ({ identityId, secretKey, publicKey }) => (
  async (dispatch) => {
    await dispatch({
      type: CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS,
      identityId,
      secretKey,
      publicKey,
    });

    await dispatch(updateBackup());
  }
);
