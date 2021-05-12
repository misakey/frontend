import isEmpty from '@misakey/core/helpers/isEmpty';
import { generateAsymmetricKeyPair } from '@misakey/core/crypto/crypto';
import { encryptCryptoaction } from '@misakey/core/crypto/cryptoactions';
import { DecryptionKeyNotFound } from '@misakey/core/crypto/Errors/classes';

export function encryptConsentSecretKey({ secretKey, recipientPublicKey }) {
  return {
    // consent keys are always sent trough the cryptoactions mechanism,
    // whether it's a data subject sending one to a data producer,
    // or vice-versa,
    // or a data subject sending one to a data consumer.
    encrypted: encryptCryptoaction(
      { consentSecretKey: secretKey },
      recipientPublicKey,
    ),
    encryptionPublicKey: recipientPublicKey,
  };
}

/**
 * @param {string} producerOrSubjectPublicKey
 * the producer pubkey if the consent key is being created by the data subject,
 * or vice-versa.
 */
export function createNewConsentKey(producerOrSubjectPublicKey) {
  const {
    secretKey,
    publicKey,
  } = generateAsymmetricKeyPair();

  const encryptedSecretKey = encryptConsentSecretKey({
    secretKey,
    recipientPublicKey: producerOrSubjectPublicKey,
  });

  return {
    publicKey,
    secretKey,
    encryptedSecretKey,
  };
}

export function getOrCreateConsentKey({
  maybeConsentPublicKey,
  asymKeysMapping,
  producerOrSubjectPublicKey,
}) {
  if (isEmpty(maybeConsentPublicKey)) {
    const {
      publicKey,
      secretKey,
      encryptedSecretKey,
    } = createNewConsentKey(producerOrSubjectPublicKey);

    return {
      consentSecretKey: secretKey,
      // the backend will send this to the producer
      // (not absolutely necessary,
      // but it's useful that both parties of the consent key
      // have the secret key, in case one loses her secrets)
      newConsentKey: {
        publicKey,
        encryptedSecretKey,
      },
    };
  }

  // `maybeConsentPublicKey` is *not* empty
  const consentPublicKey = maybeConsentPublicKey;
  const consentSecretKey = asymKeysMapping[consentPublicKey];
  if (isEmpty(consentSecretKey)) {
    throw new DecryptionKeyNotFound(`consent public key: ${consentPublicKey}`);
  }
  return {
    consentSecretKey,
    newConsentKey: null,
  };
}

/**
 * returns `consentedScopes`
 * as they should be sent to `POST /auth/consent`
 * (containing the encrypted consent keys for the data consumer,
 * and the new consent keys if some had to be created),
 * as well as the new asym keys that must be added to user's secret storage
 * (corresponding to the new consent keys).
 *
 * - `acceptedRequestedConsents` contains the items from `requestedConsents`
 * (in the response of `GET /auth/consent/info`) that the user accepted
 * - `asymKeysMapping` is simply the `asymKeys` part of the user's secret storage.
 *
 * @param {Object} param0
 * @param {Array<{
 *  scope: string,
 *  details: {
 *    consentPublicKey: string,
 *    producerOrganization: {
 *      publicKey: string
 *    }
 *  }
 * }>} param0.acceptedRequestedConsents
 * @param {{ [publicKey: string]: string; }} param0.asymKeysMapping
 * @param {string} param0.consumerPublicKey
 */
export function handleKeysForConsent({
  acceptedRequestedConsents,
  asymKeysMapping,
  consumerPublicKey,
}) {
  const consentedScopes = {};
  const newAsymKeys = {};

  acceptedRequestedConsents.forEach(
    ({
      scope,
      details,
    }) => {
      if (isEmpty(details)) {
        // this is not an error;
        // scopes like 'tos' etc have no 'details'
        return;
      }

      const {
        consentPublicKey: maybeConsentPublicKey,
        producerOrganization: {
          publicKey: producerPublicKey,
        },
      } = details;

      const {
        consentSecretKey,
        newConsentKey,
      } = getOrCreateConsentKey({
        maybeConsentPublicKey,
        asymKeysMapping,
        producerOrSubjectPublicKey: producerPublicKey,
      });

      const encryptedConsentSecretKey = encryptConsentSecretKey({
        secretKey: consentSecretKey,
        recipientPublicKey: consumerPublicKey,
      });

      consentedScopes[scope] = {
        encryptedConsentSecretKey,
      };

      if (!isEmpty(newConsentKey)) {
        consentedScopes[scope].newConsentKey = newConsentKey;
        newAsymKeys[newConsentKey.publicKey] = consentSecretKey;
      }
    },
  );

  return {
    consentedScopes,
    newAsymKeys,
  };
}
