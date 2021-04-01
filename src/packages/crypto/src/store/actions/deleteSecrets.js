import isNil from '@misakey/core/helpers/isNil';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import {
  deleteAsymKeys,
  deleteBoxKeyShares,
} from '@misakey/crypto/HttpApi';

import {
  CRYPTO_DELETE_SECRETS,
} from './types';

const {
  getRootKey: getRootKeySelector,
} = cryptoSelectors;

export default ({ asymPublicKeys, boxKeySharesBoxIds }) => (
  (dispatch, getState) => {
    const state = getState();

    dispatch({
      type: CRYPTO_DELETE_SECRETS,
      asymPublicKeys,
      boxKeySharesBoxIds,
    });

    const rootKey = getRootKeySelector(state);
    if (isNil(rootKey)) {
      return;
    }

    // no need to await these HTTP calls
    deleteAsymKeys({ publicKeys: asymPublicKeys });
    deleteBoxKeyShares({ boxIds: boxKeySharesBoxIds });
  }
);
