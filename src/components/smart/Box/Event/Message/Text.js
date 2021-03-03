import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { TIME } from '@misakey/ui/constants/formats/dates';
import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import { isBoxEventEdited } from 'helpers/boxEvent';
import decryptText from '@misakey/crypto/box/decryptText';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import useAnchormeCallback from '@misakey/hooks/useAnchorme/callback';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCardWithMenu from 'components/dumb/Card/Event/WithMenu';
import EventBoxMessagePreview from 'components/smart/Box/Event/Message/Preview';
import MuiLink from '@material-ui/core/Link';
import MenuItemEventEdit from 'components/smart/MenuItem/Event/Edit';
import MenuItemEventCopy from 'components/smart/MenuItem/Event/Copy';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';

// CONSTANTS
const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

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

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));
  const canBeDecrypted = !isNil(secretKey);

  const anchorme = useAnchormeCallback({ LinkComponent: MuiLink });

  const isEdited = useMemo(
    () => isBoxEventEdited(event),
    [event],
  );

  const date = useDateFormatMemo(serverEventCreatedAt, TIME);

  const text = useMemo(() => {
    if (canBeDecrypted) {
      const decrypted = decryptText(encrypted, secretKey);
      return preview ? decrypted : anchorme(decrypted);
    }
    return t('common:encrypted');
  }, [
    canBeDecrypted, encrypted, secretKey, t, preview, anchorme,
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
