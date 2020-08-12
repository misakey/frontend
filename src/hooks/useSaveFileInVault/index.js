
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { createSavedFile } from '@misakey/helpers/builder/vault';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { ensureVaultKeyExists } from '@misakey/crypto/store/actions/concrete';
import { encryptForVault } from '@misakey/crypto/vault';
import { addSavedFiles } from 'store/reducers/savedFiles';

export default (encryption, encryptedFileId) => {
  const identityId = useSelector(authSelectors.identityId);
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('components');

  const saveInVault = useCallback(async (vaultKey) => {
    try {
      const { encryptedMetadata, keyFingerprint, nonce } = encryptForVault(encryption, vaultKey);
      const response = await createSavedFile({
        encryptedFileId,
        encryptedMetadata,
        keyFingerprint,
        identityId,
        nonce,
      });
      dispatch(addSavedFiles(identityId, [response]));
      enqueueSnackbar(t('components:saveInVault.success'), { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(t('components:saveInVault.error'), { variant: 'error' });
    }
  }, [dispatch, encryptedFileId, encryption, enqueueSnackbar, identityId, t]);

  return useCallback(async () => {
    const vaultKey = await Promise.resolve(dispatch(ensureVaultKeyExists()));
    return saveInVault(vaultKey);
  }, [dispatch, saveInVault]);
};
