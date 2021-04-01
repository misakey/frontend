import loadSecrets from '@misakey/crypto/store/actions/loadSecrets';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import createNewRootKeyShares from '@misakey/crypto/store/actions/createNewRootKeyShares';
import {
  computeCryptoMigration,
} from '@misakey/crypto';
import {
  migrateToSecretStorage,
  getEncryptedSecretsBackup,
} from '@misakey/crypto/HttpApi';
import {
  decryptSecretStorageWithPassword,
} from '@misakey/crypto/secretStorage';
import useFetchSecretStorage from './useFetchSecretStorage';

// CONSTANTS
const {
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

// HOOKS
export default ((skipUpdate = false) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);

  const {
    data: encryptedSecretStorage,
    accountNeedsMigration,
  } = useFetchSecretStorage();

  const decryptWithPassword = useCallback(
    async (password) => {
      let secretStorage;
      if (accountNeedsMigration) {
        const {
          data: encryptedSecretsBackup,
        } = await getEncryptedSecretsBackup(accountId);
        const {
          secretStorage: ss,
          migrationPayload,
        } = (
          await computeCryptoMigration({ encryptedSecretsBackup, password })
        );
        await migrateToSecretStorage(migrationPayload);
        secretStorage = ss;
      } else {
        secretStorage = await decryptSecretStorageWithPassword(encryptedSecretStorage, password);
      }

      if (skipUpdate) {
        return secretStorage;
      }

      const { rootKey } = secretStorage;

      const keySharePromise = dispatch(createNewRootKeyShares({ rootKey, accountId }))
        // failure of root key share creation should not make secret loading fail
        .catch((reason) => {
          logSentryException(reason, 'OpenVault: create new root key share', { crypto: true });
          enqueueSnackbar(t('common:crypto.errors.rootKeyShare'), { variant: 'warning' });
        });

      await Promise.all([
        dispatch(loadSecrets({ secretStorage })),
        keySharePromise,
      ]);

      return secretStorage;
    },
    [accountId, dispatch, enqueueSnackbar, t,
      encryptedSecretStorage, skipUpdate, accountNeedsMigration],
  );

  return decryptWithPassword;
});
