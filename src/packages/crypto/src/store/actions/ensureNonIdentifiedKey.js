import isNil from '@misakey/helpers/isNil';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import { setIdentityNonIdentifiedPublicKey } from '@misakey/crypto/HttpApi';
import setIdentityNonIdentifiedKeys from '@misakey/crypto/store/actions/setIdentityNonIdentifiedKeys';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import { generateIdentityNonIdentifiedKeyPair } from '../../cryptoactions';

const { identityId: getIdentityIdSelector } = authSelectors;
const { getNonIdentifiedKeys } = cryptoSelectors;

export default () => (
  async (dispatch, getState) => {
    const state = getState();

    const { publicKeys } = getNonIdentifiedKeys(state);
    const identityId = getIdentityIdSelector(state);

    if (isNil(publicKeys) || isNil(publicKeys[identityId])) {
      try {
        const { publicKey, secretKey } = generateIdentityNonIdentifiedKeyPair();
        await setIdentityNonIdentifiedPublicKey(identityId, publicKey);
        await dispatch(setIdentityNonIdentifiedKeys({ identityId, secretKey, publicKey }));
      } catch (error) {
        logSentryException(error, 'Could not create non identified keys', { crypto: true });
      }
    }
  }
);
