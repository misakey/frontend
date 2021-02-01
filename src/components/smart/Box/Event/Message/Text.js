import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { TIME } from '@misakey/ui/constants/formats/dates';
import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { isBoxEventEdited } from 'helpers/boxEvent';
import decryptText from '@misakey/crypto/box/decryptText';

import useAnchormeCallback from '@misakey/hooks/useAnchorme/callback';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCardWithMenu from 'components/dumb/Card/Event/WithMenu';
import EventBoxMessagePreview from 'components/smart/Box/Event/Message/Preview';
import MuiLink from '@material-ui/core/Link';
import MenuItemEventEdit from 'components/smart/MenuItem/Event/Edit';
import MenuItemEventCopy from 'components/smart/MenuItem/Event/Copy';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';

// HELPERS
const decryptMessage = (publicKeysWeCanDecryptFrom, encrypted, publicKey) => {
  const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);
  return decryptText(encrypted, secretKey);
};

// COMPONENTS
const BoxMessageTextEvent = ({
  event, box,
  isFromCurrentUser, boxBelongsToCurrentUser,
  preview,
  t,
  ...rest
}) => {
  const {
    sender,
    serverEventCreatedAt,
    content: { encrypted, publicKey },
  } = useMemo(() => event, [event]);
  const { id: boxId } = useMemo(() => box, [box]);
  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);

  const anchorme = useAnchormeCallback({ LinkComponent: MuiLink });

  const isEdited = useMemo(
    () => isBoxEventEdited(event),
    [event],
  );

  const date = useDateFormatMemo(serverEventCreatedAt, TIME);

  const text = useMemo(() => {
    if (canBeDecrypted) {
      const decrypted = decryptMessage(publicKeysWeCanDecryptFrom, encrypted, publicKey);
      return preview ? decrypted : anchorme(decrypted);
    }
    return t('common:encrypted');
  }, [
    canBeDecrypted, encrypted, publicKeysWeCanDecryptFrom, publicKey, t, preview, anchorme,
  ]);

  const items = useMemo(
    () => {
      if (isFromCurrentUser) {
        return [
          <MenuItemEventEdit event={event} box={box} key="edit" />,
          <MenuItemEventCopy event={event} key="copy" />,
          <MenuItemEventDelete event={event} boxId={boxId} key="delete" />,
        ];
      }
      if (boxBelongsToCurrentUser) {
        return [
          <MenuItemEventCopy event={event} key="copy" />,
          <MenuItemEventDelete event={event} boxId={boxId} key="delete" />,
        ];
      }
      return [
        <MenuItemEventCopy event={event} key="copy" />,
      ];
    },
    [isFromCurrentUser, boxBelongsToCurrentUser, event, box, boxId],
  );
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
    <EventCardWithMenu
      author={sender}
      date={date}
      text={text}
      isEdited={isEdited}
      items={items}
      {...omitTranslationProps(rest)}
    />
  );
};

BoxMessageTextEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  preview: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

BoxMessageTextEvent.defaultProps = {
  isFromCurrentUser: false,
  boxBelongsToCurrentUser: false,
  preview: false,
};

export default withTranslation('common')(BoxMessageTextEvent);
