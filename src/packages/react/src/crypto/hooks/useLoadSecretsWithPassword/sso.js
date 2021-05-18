import loadSecrets from '@misakey/react/crypto/store/actions/loadSecrets';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { createRootKeyShareFromAuthFlowBuilder } from '@misakey/core/auth/builder/rootKeyShares';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFetchSecretStorageSso from '@misakey/react/crypto/hooks/useFetchSecretStorage/sso';

import createNewRootKeyShares from '@misakey/react/crypto/store/actions/createNewRootKeyShares';
import {
  computeCryptoMigration,
} from '@misakey/core/crypto';
import {
  migrateToSecretStorage,
  getEncryptedSecretsBackup,
} from '@misakey/core/crypto/HttpApi';
import {
  decryptSecretStorageWithPassword,
} from '@misakey/core/crypto/secretStorage';

// CONSTANTS
const {
  accountId: ACCOUNT_ID_SELECTOR,
} = authSelectors;

const {
  subjectIdentity: SUBJECT_IDENTITY_SELECTOR,
} = ssoSelectors;

// HOOKS
export default ((skipUpdate = false, isReady = true) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');

  const accountIdAuth = useSelector(ACCOUNT_ID_SELECTOR);
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { accountId: accountIdSso } = useSafeDestr(subjectIdentity);

  const accountId = useMemo(
    () => accountIdAuth || accountIdSso,
    [accountIdAuth, accountIdSso],
  );

  const {
    data,
    accountNeedsMigration,
  } = useFetchSecretStorageSso(isReady);
  const { secrets: encryptedSecretStorage } = useSafeDestr(data);

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

      await Promise.all([
        dispatch(loadSecrets({ secretStorage })),
        dispatch(createNewRootKeyShares({
          rootKey,
          accountId,
          uploadMisakeyShare: createRootKeyShareFromAuthFlowBuilder,
        }))
        // failure of root key share creation should not make secret loading fail
          .catch((reason) => {
            logSentryException(reason, 'OpenVault: create new root key share', { crypto: true });
            enqueueSnackbar(t('common:crypto.errors.rootKeyShare'), { variant: 'warning' });
          }),
      ]);

      return secretStorage;
    },
    [accountId, dispatch, enqueueSnackbar, t,
      encryptedSecretStorage, skipUpdate, accountNeedsMigration],
  );

  return decryptWithPassword;
});
