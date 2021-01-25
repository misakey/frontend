import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

import EventBoxMessagePreview from 'components/smart/Box/Event/Message/Preview';
import EventFileCard, { FileCardEventSkeleton } from 'components/smart/Box/Event/Message/File/Card';
import useDecryptMsgFileEffect from 'hooks/useDecryptMsgFile/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// COMPONENTS
const BoxMessageFileEvent = ({ event, isFromCurrentUser, preview, t, ...props }) => {
  const { sender, content } = useMemo(() => event, [event]);
  const { encryptedFileId, decryptedFile, publicKey } = useSafeDestr(content);
  const { name } = useSafeDestr(decryptedFile);

  const { displayName } = useMemo(() => sender || {}, [sender]);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const { isReady } = useDecryptMsgFileEffect(event, secretKey, isFromCurrentUser);
  const text = useMemo(() => (isReady ? name : t('common:loading')), [isReady, name, t]);

  if (preview) {
    return (
      <EventBoxMessagePreview
        isFromCurrentUser={isFromCurrentUser}
        displayName={displayName}
        text={text}
        {...omitTranslationProps(props)}
      />
    );
  }

  if (!isReady) {
    return (
      <FileCardEventSkeleton
        sender={sender}
        isFromCurrentUser={isFromCurrentUser}
        {...omitTranslationProps(props)}
      />
    );
  }

  return (
    <EventFileCard
      sender={sender}
      isFromCurrentUser={isFromCurrentUser}
      encryptedFileId={encryptedFileId}
      event={event}
      {...omitTranslationProps(props)}
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

export default withTranslation('common')(BoxMessageFileEvent);
