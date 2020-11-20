import {
  CRYPTO_SET_IDENTITY_KEY,
} from './types';

import updateBackup from './updateBackup';

export default ({ identityId, secretKey, publicKey }) => (
  async (dispatch) => {
    await dispatch({
      type: CRYPTO_SET_IDENTITY_KEY,
      identityId,
      secretKey,
      publicKey,
    });

    await dispatch(updateBackup());
  }
);
