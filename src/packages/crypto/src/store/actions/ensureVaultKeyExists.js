import isNil from '@misakey/helpers/isNil';

import {
  generateSymmetricKey,
} from '@misakey/crypto/crypto';

import setVaultKey from './setVaultKey';

export default () => (
  async (dispatch, getState) => {
    const storeVaultKey = getState().crypto.secrets.vaultKey;

    if (isNil(storeVaultKey)) {
      const vaultKey = await generateSymmetricKey();
      // setVaultKey already takes care of triggering a backup update
      dispatch(setVaultKey({ vaultKey }));
      return vaultKey;
    }

    return storeVaultKey;
  }
);
