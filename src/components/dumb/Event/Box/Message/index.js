import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxMessageFileEvent from 'components/dumb/Event/Box/Message/File';
import BoxMessageTextEvent from 'components/dumb/Event/Box/Message/Text';

import EventSchema from 'store/schemas/Boxes/Events';
import { MSG_FILE, MSG_TXT } from 'constants/app/boxes/events';

const BoxMessageEvent = ({ event, boxID, isFromCurrentUser, ...props }) => {
  const { type } = useMemo(() => event, [event]);

  if (type === MSG_FILE) {
    return (
      <BoxMessageFileEvent
        event={event}
        boxID={boxID}
        isFromCurrentUser={isFromCurrentUser}
        {...props}
      />
    );
  }

  if (type === MSG_TXT) {
    return <BoxMessageTextEvent event={event} isFromCurrentUser={isFromCurrentUser} {...props} />;
  }

  return null;
};

BoxMessageEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  isFromCurrentUser: PropTypes.bool.isRequired,
  boxID: PropTypes.string.isRequired,
};

export default BoxMessageEvent;
