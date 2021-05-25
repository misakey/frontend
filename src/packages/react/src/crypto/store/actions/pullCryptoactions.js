import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import log from '@misakey/core/helpers/log';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import propOrEmptyObject from '@misakey/core/helpers/propOr/emptyObject';
import asyncBatch from '@misakey/react/crypto/store/helpers/reduxBatchAsync';
import {
  DecryptionKeyNotFound,
} from '@misakey/core/crypto/Errors/classes';
import {
  listCryptoActions,
  deleteCryptoaction,
} from '@misakey/core/crypto/HttpApi';

import processSetBoxKeyShareCryptoAction from './processSetBoxKeyShareCryptoAction';
import processConsentKeyCryptoAction from './processConsentKeyCryptoAction';

const { accountId: ACCOUNT_ID_SELECTOR } = authSelectors;
const { subjectIdentity: SUBJECT_IDENTITY_SELECTOR } = ssoSelectors;

/**
 * pullCryptoactions fetches the cryptoactions for the current account
 * and applies all the ones that can be applied immediately
 * (an example of cryptoaction that cannot be applied automatically
 * are auto invitations because the user must consent to joining the box
 * before we apply it).
 *
 * The name “pull” is a reference to `git pull` that fetches new commits
 * *and* applies them (merges the remote branch into the local one).
 */
export default () => (
  async (dispatch, getState) => {
    const state = getState();
    const accountIdAuth = ACCOUNT_ID_SELECTOR(state);
    const subjectIdentity = SUBJECT_IDENTITY_SELECTOR(state);
    const accountIdSso = propOrEmptyObject('accountId', subjectIdentity);

    const accountId = accountIdAuth || accountIdSso;

    // cryptoactions is supposed to be an array
    const cryptoactions = await listCryptoActions({ accountId });

    const processedIds = [];
    await asyncBatch(async () => {
      // If we want to process cryptoactions one after the other
      // we have to use a `for` loop with `await` in it
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const cryptoaction of cryptoactions) {
        const { id, type } = cryptoaction;

        // `wasProcessed` is true unless we set it to `false`.
        // This way we don't have to add `wasProcessed = true`
        // every time there is a new type of cryptoaction we handle in this action
        let wasProcessed = true;

        try {
          switch (type) {
            case 'set_box_key_share':
              // action processSetBoxKeyShareCryptoAction takes care of updating secret storage
              await dispatch(processSetBoxKeyShareCryptoAction({
                cryptoaction,
              }));
              break;
            case 'consent_key':
              // action processConsentKeyCryptoAction takes care of updating secret storage
              await dispatch(processConsentKeyCryptoAction({
                cryptoaction,
              }));
              break;
            default:
              wasProcessed = false;
              break;
          }
        } catch (error) {
          if (error instanceof DecryptionKeyNotFound) {
            log(`skipping cryptoaction: ${error}`, 'warn');
          } else {
            logSentryException(error, 'processing cryptoaction', { crypto: true });
          }
          wasProcessed = false;
        }

        if (wasProcessed) {
          processedIds.push(id);
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */
    });

    // TODO use batch deletion when backend supports it
    processedIds.forEach((id) => {
      // no need to await the deletion of cryptoactions
      deleteCryptoaction({ accountId, cryptoactionId: id });
    });
  }
);
