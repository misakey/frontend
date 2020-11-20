import isEmpty from '@misakey/helpers/isEmpty';

import updateBackup from './updateBackup';
import {
  CRYPTO_REMOVE_BOX_KEY_SHARES,
  CRYPTO_REMOVE_BOX_SECRET_KEYS,
} from './types';

export default ({ secretKeys, boxIds }) => (
  async (dispatch) => {
    if (!isEmpty(secretKeys)) {
      await dispatch({
        type: CRYPTO_REMOVE_BOX_SECRET_KEYS,
        secretKeys,
      });
    }

    if (!isEmpty(boxIds)) {
      await dispatch({
        type: CRYPTO_REMOVE_BOX_KEY_SHARES,
        boxIds,
      });
    }

    await dispatch(updateBackup());
  }
);
