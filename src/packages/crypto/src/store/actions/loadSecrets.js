import asyncBatch from '@misakey/crypto/helpers/reduxBatchAsync';

import pullCryptoactions from './pullCryptoactions';

import {
  CRYPTO_LOAD_SECRETS,
} from './types';

export default ({ secretStorage }) => (
  async (dispatch) => {
    await asyncBatch(async () => {
      dispatch({
        type: CRYPTO_LOAD_SECRETS,
        secretStorage,
      });

      await dispatch(pullCryptoactions());
    });
  }
);
