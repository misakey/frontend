import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { TIME } from 'constants/formats/dates';
import { CLOSED } from 'constants/app/boxes/statuses';
import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { isBoxEventEdited } from 'helpers/boxEvent';
import decryptText from '@misakey/crypto/box/decryptText';

import useAnchormeCallback from '@misakey/hooks/useAnchorme/callback';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCard from 'components/dumb/Card/Event';
import EventBoxMessagePreview from 'components/smart/Box/Event/Message/Preview';
import MuiLink from '@material-ui/core/Link';
import withContextMenu from '@misakey/ui/Menu/ContextMenu/with';
import MenuItemEventEdit from 'components/smart/MenuItem/Event/Edit';
import MenuItemEventCopy from 'components/smart/MenuItem/Event/Copy';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';

// CONSTANTS
const MY_TRANSFORM_ORIGIN = {
  vertical: 'top',
  horizontal: 'right',
};

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

// COMPONENTS
const EventCardWithContextMenu = withContextMenu(EventCard);

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
  const { lifecycle } = useMemo(() => box, [box]);
  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);

  const anchorme = useAnchormeCallback({ LinkComponent: MuiLink, linkProps: LINK_PROPS });

  const isEdited = useMemo(
    () => isBoxEventEdited(event),
    [event],
  );

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const date = useDateFormatMemo(serverEventCreatedAt, TIME);

  const menuProps = useMemo(
    () => (isFromCurrentUser
      ? { transformOrigin: MY_TRANSFORM_ORIGIN }
      : {}),
    [isFromCurrentUser],
  );

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
      if (isFromCurrentUser && !isClosed) {
        return [
          <MenuItemEventEdit event={event} box={box} key="edit" />,
          <MenuItemEventCopy event={event} key="copy" />,
          <MenuItemEventDelete event={event} box={box} key="delete" />,
        ];
      }
      if (boxBelongsToCurrentUser && !isClosed) {
        return [
          <MenuItemEventCopy event={event} key="copy" />,
          <MenuItemEventDelete event={event} box={box} key="delete" />,
        ];
      }
      return [
        <MenuItemEventCopy event={event} key="copy" />,
      ];
    },
    [isFromCurrentUser, isClosed, boxBelongsToCurrentUser, event, box],
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
    <EventCardWithContextMenu
      author={sender}
      date={date}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      isEdited={isEdited}
      items={items}
      menuProps={menuProps}
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
