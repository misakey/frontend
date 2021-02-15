import asyncBatch from '@misakey/helpers/redux/batch/async';

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
