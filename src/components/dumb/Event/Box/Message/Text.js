import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import decryptText from '@misakey/crypto/box/decryptText';

import EventCard from 'components/dumb/Event/Card';
import EventBoxMessagePreview from 'components/dumb/Event/Box/Message/Preview';

import EventSchema from 'store/schemas/Boxes/Events';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';

// HELPERS
const decryptMessage = (publicKeysWeCanDecryptFrom, encrypted, publicKey) => {
  const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);
  return decryptText(encrypted, secretKey);
};

const BoxMessageTextEvent = ({ event, isFromCurrentUser, preview, t, ...rest }) => {
  const { sender, content: { encrypted, publicKey } } = useMemo(() => event, [event]);
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);

  const text = useMemo(() => {
    if (canBeDecrypted) {
      return decryptMessage(publicKeysWeCanDecryptFrom, encrypted, publicKey);
    }
    return t('common:encrypted');
  }, [canBeDecrypted, encrypted, publicKeysWeCanDecryptFrom, publicKey, t]);

  if (preview) {
    return (
      <EventBoxMessagePreview
        isFromCurrentUser={isFromCurrentUser}
        displayName={sender.displayName}
        text={text}
      />
    );
  }

  return (
    <EventCard
      author={sender}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      {...omitTranslationProps(rest)}
    />
  );
};

BoxMessageTextEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  preview: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

BoxMessageTextEvent.defaultProps = {
  isFromCurrentUser: false,
  preview: false,
};

export default withTranslation('common')(BoxMessageTextEvent);
