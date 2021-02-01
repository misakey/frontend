import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import { setIdentityPublicKey } from '@misakey/crypto/HttpApi';
import { generateIdentityKeyPair } from '@misakey/crypto/cryptoactions';
import setIdentitySecretKey from '@misakey/crypto/store/actions/setIdentitySecretKey';

const {
  identityId: selectIdentityId,
} = authSelectors;

export default () => (
  async (dispatch, getState) => {
    const state = getState();

    const identityKeys = path(['crypto', 'secrets', 'identityKeys'], state) || {};

    const identityId = selectIdentityId(state);

    if (isNil(identityKeys.publicKeys[identityId])) {
      try {
        const { publicKey, secretKey } = generateIdentityKeyPair();
        await setIdentityPublicKey(identityId, publicKey);
        await dispatch(setIdentitySecretKey({ identityId, secretKey, publicKey }));
      } catch (error) {
        // if we were unable to create an identity key we can still continue
        // the only consequence is that
        // people won't be able to invte us without using an invitation link
        log(error, 'error');
      }
    }
  }
);
