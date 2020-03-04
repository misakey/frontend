import {
  BadPassword,
  BackupDecryptionError,
} from '../../Errors/classes';

export const secretsAreLoaded = (store) => Boolean(store.crypto.secrets.secretKey);

export async function promptForPasswordUntilOK(tryPassword, openPasswordPrompt) {
  let firstAttempt = true;
  let password;
  // We exit this loop with "return"
  // (or with an error different than "BadPassword" or "BackupDecryptionError").
  // As to ESLint rule "no-await-in-loop":
  // this rule is about loops where iterations are independent from one another,
  // which is not the case here (next loop is executed if previous loop failed)
  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    ({ password } = await openPasswordPrompt({ firstAttempt }));
    try {
      await tryPassword(password);
      return;
    } catch (error) {
      // @TODO make "loadSecretsBackup" throw "BadPassword" on decryption error
      if (error instanceof BadPassword || error instanceof BackupDecryptionError) {
        firstAttempt = false;
      } else {
        throw error;
      }
    }
  }
}
