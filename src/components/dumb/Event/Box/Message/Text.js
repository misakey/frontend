import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import decryptText from '@misakey/crypto/box/decryptText';

import useAnchormeCallback from '@misakey/hooks/useAnchorme/callback';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

import EventCard from 'components/dumb/Event/Card';
import EventBoxMessagePreview from 'components/dumb/Event/Box/Message/Preview';
import MuiLink from '@material-ui/core/Link';

// CONSTANTS
const LINK_PROPS = {
  color: 'secondary',
  target: '_blank',
  rel: 'noopener noreferrer',
};

// HELPERS
const decryptMessage = (publicKeysWeCanDecryptFrom, encrypted, publicKey) => {
  const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);
  return decryptText(encrypted, secretKey);
};

const BoxMessageTextEvent = ({ event, isFromCurrentUser, preview, t, ...rest }) => {
  const { sender, content: { encrypted, publicKey } } = useMemo(() => event, [event]);
  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);

  const anchorme = useAnchormeCallback({ LinkComponent: MuiLink, linkProps: LINK_PROPS });

  const text = useMemo(() => {
    if (canBeDecrypted) {
      const decrypted = decryptMessage(publicKeysWeCanDecryptFrom, encrypted, publicKey);
      return preview ? decrypted : anchorme(decrypted);
    }
    return t('common:encrypted');
  }, [
    canBeDecrypted, encrypted, publicKeysWeCanDecryptFrom, publicKey, t, preview, anchorme,
  ]);

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
