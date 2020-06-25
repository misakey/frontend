import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import BoxMessageEvent from 'components/dumb/Event/Box/Message';
import BoxInformationEvent from 'components/dumb/Event/Box/Information';
import BoxEventsSchema from 'store/schemas/Boxes/Events';

import EVENTS_TYPE from 'constants/app/boxes/events';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

function BoxEvents({ event, boxID, preview }) {
  const { identifier } = useSelector(getCurrentUserSelector) || {};

  const isFromCurrentUser = useMemo(
    () => identifier.value === event.sender.identifier.value,
    [event.sender.identifier.value, identifier.value],
  );

  if (EVENTS_TYPE.information.includes(event.type)) {
    return (
      <BoxInformationEvent
        key={event.id}
        event={event}
        isFromCurrentUser={isFromCurrentUser}
        preview={preview}
      />
    );
  }
  if (EVENTS_TYPE.message.includes(event.type)) {
    return (
      <BoxMessageEvent
        key={event.id}
        event={event}
        boxID={boxID}
        isFromCurrentUser={isFromCurrentUser}
        preview={preview}
      />
    );
  }
  return null;
}

BoxEvents.propTypes = {
  preview: PropTypes.bool,
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,
  boxID: PropTypes.string.isRequired,
};

BoxEvents.defaultProps = {
  preview: false,
};


export default BoxEvents;
