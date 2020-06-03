import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxMessageFileEvent from 'components/dumb/Event/Box/Message/File';
import BoxMessageTextEvent from 'components/dumb/Event/Box/Message/Text';
import isNil from '@misakey/helpers/isNil';

import EventSchema from 'store/schemas/Boxes/Events';
import { MSG_FILE, MSG_TXT } from 'constants/app/boxes/events';

const BoxMessageEvent = ({ event }) => {
  const { sender, type } = useMemo(() => event, [event]);

  const isFromCurrentUser = useMemo(
    () => !isNil(sender.id),
    [sender.id],
  );

  if (type === MSG_FILE) {
    return <BoxMessageFileEvent event={event} isFromCurrentUser={isFromCurrentUser} />;
  }

  if (type === MSG_TXT) {
    return <BoxMessageTextEvent event={event} isFromCurrentUser={isFromCurrentUser} />;
  }

  return null;
};

BoxMessageEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
};

export default BoxMessageEvent;
