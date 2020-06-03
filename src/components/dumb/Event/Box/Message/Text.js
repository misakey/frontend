import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventCard from 'components/dumb/Event/Card';

import EventSchema from 'store/schemas/Boxes/Events';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';

// @FIXME: implement
// eslint-disable-next-line no-unused-vars
const decryptText = (publicKeysWeCanDecryptFrom, encrypted, recipientPublicKey) => 'decrypted !';

const BoxMessageTextEvent = ({ event, isFromCurrentUser, t, ...rest }) => {
  const { sender, content: { encrypted, recipientPublicKey } } = useMemo(() => event, [event]);
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(recipientPublicKey);
  const text = useMemo(() => {
    if (canBeDecrypted) {
      return decryptText(publicKeysWeCanDecryptFrom, encrypted, recipientPublicKey);
    }
    return t('common:undecryptable');
  }, [canBeDecrypted, encrypted, publicKeysWeCanDecryptFrom, recipientPublicKey, t]);

  return (
    <EventCard
      author={sender}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      {...rest}
    />
  );
};

BoxMessageTextEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

BoxMessageTextEvent.defaultProps = {
  isFromCurrentUser: false,
};

export default withTranslation('common')(BoxMessageTextEvent);
