/* Redux Middleware interacting with the crypto SDK
 * -------------------------------------------------------
 */

import { SIGN_OUT } from '@misakey/auth/store/actions/auth';
import { ownerCryptoContext as cryptoContext } from '@misakey/crypto';

export default () => (next) => (action) => {
  switch (action.type) {
    case SIGN_OUT:
      cryptoContext.signOut();
      break;
    default:
      break;
  }

  return next(action);
};
