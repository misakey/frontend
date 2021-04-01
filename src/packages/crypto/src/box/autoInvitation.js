// Auto invitation allows a box admin to invite an existing Misakey user
// without having to send this user the invitation link of the box.
// See https://backend.docs.misakey.dev/concepts/box-events/
import isEmpty from '@misakey/core/helpers/isEmpty';
import propOr from '@misakey/core/helpers/propOr';

import { ACCESS_ADD } from '@misakey/ui/constants/boxes/events';
import { RESTRICTION_TYPES } from '@misakey/ui/constants/boxes/accesses';

import { getIdentityPublicKeys } from '@misakey/crypto/HttpApi';
import { encryptCryptoaction } from '@misakey/crypto/cryptoactions';

// CONSTANTS
const EMPTY_CONTENT = {};

// HELPERS
const contentPropOrEmpty = propOr(EMPTY_CONTENT, 'content');

/**
 * Returns the provided event with added data for auto-invitation
 * (if possible)
 *
 * @param {*} event must be an `access.add` event with `restriction_type = "identifier"`
 */
export async function tryAddingAutoInvite({ event, boxSecretKey, boxKeyShare }) {
  if (event.type !== ACCESS_ADD) {
    // XXX maybe we should just log an error and return without doing anything,
    // to make sure we don't crash the caller
    throw Error('unexpected event type');
  }

  if (event.content.restrictionType !== RESTRICTION_TYPES.IDENTIFIER) {
    return event;
  }

  const identifier = event.content.value;
  const identityPublicKeys = await getIdentityPublicKeys(identifier);

  if (isEmpty(identityPublicKeys)) {
    return event;
  }

  return {
    ...event,
    content: {
      ...contentPropOrEmpty(event),
      autoInvite: true,
    },
    // Note that "pubkey" is base64, which may not play well with snakeCaseDeep
    // that is called by the HTTP API layer.
    // We added an heuristic in snakeCaseDeep
    // that is supposed to differentiate base64 from a camelCase name.
    extra: Object.fromEntries(
      identityPublicKeys.map((pubkey) => {
        // in a first iteration the frontend will only use the box key share
        // when consuming auto-invitations;
        // but soon after (when the backend provides an endpoint
        // to let users knowing the box secret key to get the box key share)
        // the frontend will use the box secret key instead;
        // as a result right now we put *both* values in crypto actions;
        // when the frontend starts only using the "box secret key" part,
        // we may stop including the "box key share" in the crypto action
        const action = {
          boxKeyShare,
          boxSecretKey,
        };
        return [pubkey, encryptCryptoaction(action, pubkey)];
      }),
    ),
  };
}
