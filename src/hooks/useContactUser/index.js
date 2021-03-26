import { useDispatch, batch } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useHistory, generatePath } from 'react-router-dom';
import routes from 'routes';

import { contactUserBuilder } from '@misakey/helpers/builder/identities';
import { useCallback, useMemo } from 'react';
import { encryptCryptoaction } from '@misakey/crypto/cryptoactions';
import { createCryptoForNewBox } from '@misakey/crypto/box/creation';
import setBoxSecrets from '@misakey/crypto/store/actions/setBoxSecrets';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import { addJoinedBox } from 'store/reducers/box';

export default (targetIdentity, fromIdentity) => {
  const { displayName, id: identityId } = useSafeDestr(fromIdentity);

  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');
  const history = useHistory();

  const {
    identityId: contactedIdentityId,
    profile,
  } = useMemo(() => targetIdentity, [targetIdentity]);

  const {
    nonIdentifiedPubkey: contactedPublicKey,
    displayName: contactedDisplayName,
  } = useSafeDestr(profile);

  const boxTitle = useMemo(() => `${displayName} - ${contactedDisplayName}`, [contactedDisplayName, displayName]);

  const onStoreNewBoxAndSecrets = useCallback(
    (box, keyShare) => Promise.resolve(batch(() => {
      const { id: boxId } = box;
      return Promise.all([
        dispatch(addJoinedBox(box)),
        dispatch(setBoxSecrets({ boxId, keyShare })),
      ]);
    })),
    [dispatch],
  );

  const onRedirectToNewBox = useCallback(
    (id) => history.push(generatePath(routes.boxes.read._, { id })),
    [history],
  );

  const onError = useCallback(
    (err) => {
      logSentryException(err, 'Could not create contact box');
      enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'warning' });
    },
    [enqueueSnackbar, t],
  );

  const onContactUserBuilder = useCallback(
    (box, keyShare, invitationData) => contactUserBuilder(identityId, {
      identityId: contactedIdentityId,
      box,
      keyShare,
      crypto: {
        invitationData,
      },
    }),
    [contactedIdentityId, identityId],
  );

  const buildExtraField = useCallback(
    (boxKeyShare, boxSecretKey) => ({
      [contactedPublicKey]: encryptCryptoaction({ boxKeyShare, boxSecretKey }, contactedPublicKey),
    }),
    [contactedPublicKey],
  );

  const onContactUser = useCallback(
    async (title = boxTitle, onSuccess) => {
      try {
        const {
          boxPublicKey, boxSecretKey,
          invitationKeyShare: boxKeyShare,
          misakeyKeyShare: keyShare,
        } = createCryptoForNewBox();
        const invitationData = buildExtraField(boxKeyShare, boxSecretKey);
        const box = await onContactUserBuilder(
          { publicKey: boxPublicKey, title: title || boxTitle },
          keyShare,
          invitationData,
        );
        await onStoreNewBoxAndSecrets(box, boxKeyShare);
        await onSuccess(box);
        onRedirectToNewBox(box.id);
      } catch (err) {
        onError(err);
      }
    },
    [boxTitle, buildExtraField, onContactUserBuilder,
      onStoreNewBoxAndSecrets, onRedirectToNewBox, onError],
  );

  return {
    onContactUser,
    boxDefaultTitle: boxTitle,
  };
};

