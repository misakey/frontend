import isEqual from '@misakey/helpers/isEqual';

import { deriveSymmetricKeyFromLowEntropySecret } from '../../crypto';

import {
  BadPassword,
} from '../../Errors/classes';

import ensureSecretsLoaded from './ensureSecretsLoaded';

import {
  promptForPasswordUntilOK,
  secretsAreLoaded,
} from './helpers';

async function checkPasswordAgainstSaltedSymmetricKey(password, saltedSymmetricKey) {
  const { symmetricKey: expected, salt } = saltedSymmetricKey;
  const derivedKey = await deriveSymmetricKeyFromLowEntropySecret(password, salt);

  if (!isEqual(derivedKey, expected)) {
    throw new BadPassword();
  }

  // @FIXME should we return something in case of success?
}

export default function askForPassword(openPasswordPrompt) {
  return async (dispatch, getState) => {
    const store = getState();

    if (secretsAreLoaded(store)) {
      const { backupKey } = store.crypto;
      await promptForPasswordUntilOK(
        async (password) => (
          checkPasswordAgainstSaltedSymmetricKey(password, backupKey)
        ),
        openPasswordPrompt,
      );
    } else {
      // ensureSecretsLoaded will require a correct password
      await dispatch(ensureSecretsLoaded({ openPasswordPrompt }));
    }
  };
}
