import React from 'react';
import PropTypes from 'prop-types';

import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';
import { MSG_FILE, MSG_TXT } from '@misakey/core/api/constants/boxes/events';

import isNil from '@misakey/core/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import BoxMessageFileEvent from 'components/smart/Box/Event/Message/File';
import BoxMessageTextEvent from 'components/smart/Box/Event/Message/Text';
import BoxEventDeleted from 'components/smart/Box/Event/Deleted';

// COMPONENTS
const BoxMessageEvent = ({ event, ...props }) => {
  const { type, content: { deleted } } = useSafeDestr(event);

  if (!isNil(deleted)) {
    return (
      <BoxEventDeleted
        event={event}
        {...deleted}
        {...props}
      />
    );
  }

  if (type === MSG_FILE) {
    return (
      <BoxMessageFileEvent
        event={event}
        {...props}
      />
    );
  }

  if (type === MSG_TXT) {
    return (
      <BoxMessageTextEvent
        event={event}
        {...props}
      />
    );
  }

  return null;
};

BoxMessageEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  isFromCurrentUser: PropTypes.bool.isRequired,
  preview: PropTypes.bool,
};

BoxMessageEvent.defaultProps = {
  preview: false,
};

export default BoxMessageEvent;
