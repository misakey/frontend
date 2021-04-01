import { createRootKeyShareBuilder } from '@misakey/core/auth/builder/rootKeyShares';
import { splitRootKey } from '@misakey/crypto/secretStorage/rootKeyShares';

import setRootKeyShare from './setRootKeyShare';

/**
 * **Note:** for creating the root key share during the auth flow,
 * there is a dedicated function `createNewRootKeySharesFromAuthFlow`
 */
export default function createNewRootKeyShares({
  rootKey,
  accountId,
  uploadMisakeyShare = createRootKeyShareBuilder,
}) {
  return async (dispatch) => {
    const {
      localRootKeyShare: localShare,
      misakeyRootKeyShare: misakeyShare,
    } = splitRootKey(rootKey, { accountId });

    await uploadMisakeyShare(misakeyShare);

    return dispatch(setRootKeyShare({
      rootKeyShare: localShare,
      accountId,
    }));
  };
}
