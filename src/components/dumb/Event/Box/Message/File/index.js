import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import decryptFileMsg from '@misakey/crypto/box/decryptFileMsg';

import EventBoxMessagePreview from 'components/dumb/Event/Box/Message/Preview';
import EventFileCard from 'components/dumb/Event/Box/Message/File/Card';

import EventSchema from 'store/schemas/Boxes/Events';


// COMPONENTS
const BoxMessageFileEvent = ({ event, isFromCurrentUser, preview, t }) => {
  const {
    sender,
    content: { encrypted, encryptedFileId, publicKey },
  } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender || {}, [sender]);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );
  const canBeDecrypted = useMemo(() => !isNil(secretKey), [secretKey]);

  const decryptedContent = useMemo(
    () => (canBeDecrypted ? decryptFileMsg(encrypted, secretKey) : {}),
    [canBeDecrypted, encrypted, secretKey],
  );

  const { fileName } = useMemo(() => decryptedContent, [decryptedContent]);

  const text = useMemo(
    () => (canBeDecrypted ? fileName : t('common:encrypted')),
    [canBeDecrypted, fileName, t],
  );

  if (preview) {
    return (
      <EventBoxMessagePreview
        isFromCurrentUser={isFromCurrentUser}
        displayName={displayName}
        text={text}
      />
    );
  }

  return (
    <EventFileCard
      text={text}
      sender={sender}
      canBeDecrypted={canBeDecrypted}
      decryptedContent={decryptedContent}
      isFromCurrentUser={isFromCurrentUser}
      encryptedFileId={encryptedFileId}
    />
  );
};

BoxMessageFileEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  preview: PropTypes.bool,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

BoxMessageFileEvent.defaultProps = {
  isFromCurrentUser: false,
  preview: false,
};

export default withTranslation('boxes')(BoxMessageFileEvent);
