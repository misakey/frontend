import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxMessageFileEvent from 'components/dumb/Event/Box/Message/File';
import BoxMessageTextEvent from 'components/dumb/Event/Box/Message/Text';

import EventSchema from 'store/schemas/Boxes/Events';
import { MSG_FILE, MSG_TXT } from 'constants/app/boxes/events';

const BoxMessageEvent = ({ event, getIsFromCurrentUser }) => {
  const { sender, type } = useMemo(() => event, [event]);

  const isFromCurrentUser = useMemo(
    () => getIsFromCurrentUser(sender.identifier),
    [getIsFromCurrentUser, sender.identifier],
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
  getIsFromCurrentUser: PropTypes.func.isRequired,
};

export default BoxMessageEvent;
