/* the crypto package exports instances and not classes:
 * this is a singleton pattern
 */

import {
  OwnerCryptoContext,
} from './classes';

// code for the soon-to-be-retired MK Databox protocol
// mostly copied from https://gitlab.misakey.dev/misakey/crypto-js-sdk/
// and re-using new code (code out of databox/)
// only when strictly necessary
import * as databox from './databox';

export const ownerCryptoContext = new OwnerCryptoContext();
ownerCryptoContext.databox = new databox.OwnerCryptoContext(ownerCryptoContext.store);

// For now no crypto context is available for producer operations in the MK Data protocol,
// but we still create a producerCryptoContext
// just to put the "databox" part in it
// to mimick the API of the owner context
export const producerCryptoContext = {};
producerCryptoContext.databox = new databox.ProducerCryptoContext();
