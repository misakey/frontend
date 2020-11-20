import updateBackup from './updateBackup';
import {
  CRYPTO_SET_BOX_SECRETS,
} from './types';

/**
 * set secret key and/or key share for a box
 *
 * this will overwrite the existing key share for this box if any
 */
export default ({ boxId, secretKey, keyShare }) => (
  async (dispatch) => {
    await dispatch({
      type: CRYPTO_SET_BOX_SECRETS,
      boxId,
      secretKey,
      keyShare,
    });

    await dispatch(updateBackup());
  }
);
