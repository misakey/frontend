import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventCard from 'components/dumb/Event/Card';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import EventSchema from 'store/schemas/Boxes/Events';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';

// @FIXME crypto: implement
// eslint-disable-next-line no-unused-vars
const decryptText = (publicKeysWeCanDecryptFrom, encrypted, recipientPublicKey) => atob(encrypted);

const BoxMessageTextEvent = ({ event, isFromCurrentUser, preview, t, ...rest }) => {
  const { sender, content: { encrypted, recipientPublicKey } } = useMemo(() => event, [event]);
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  // @FIXME crypto
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(recipientPublicKey) || true;
  const text = useMemo(() => {
    if (canBeDecrypted) {
      return decryptText(publicKeysWeCanDecryptFrom, encrypted, recipientPublicKey);
    }
    return t('common:undecryptable');
  }, [canBeDecrypted, encrypted, publicKeysWeCanDecryptFrom, recipientPublicKey, t]);

  if (preview) {
    return t(
      `boxes:list.events.preview.message.${isFromCurrentUser ? 'you' : 'they'}`,
      { displayName: sender.displayName, text },
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
