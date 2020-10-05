import React from 'react';
import PropTypes from 'prop-types';

import EVENTS_TYPE from 'constants/app/boxes/events';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useEventBelongsToCurrentUser from 'hooks/useEventBelongsToCurrentUser';

import BoxMessageEvent from 'components/smart/Box/Event/Message';
import BoxInformationEvent from 'components/smart/Box/Event/Information';

function BoxEvents({ event, box, preview, ...rest }) {
  const isFromCurrentUser = useEventBelongsToCurrentUser(event);
  const boxBelongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  if (EVENTS_TYPE.information.includes(event.type)) {
    return (
      <BoxInformationEvent
        key={event.id}
        event={event}
        isFromCurrentUser={isFromCurrentUser}
        preview={preview}
        box={box}
        {...rest}
      />
    );
  }
  if (EVENTS_TYPE.message.includes(event.type)) {
    return (
      <BoxMessageEvent
        key={event.id}
        event={event}
        isFromCurrentUser={isFromCurrentUser}
        boxBelongsToCurrentUser={boxBelongsToCurrentUser}
        preview={preview}
        box={box}
        {...rest}
      />
    );
  }
  return null;
}

BoxEvents.propTypes = {
  preview: PropTypes.bool,
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

BoxEvents.defaultProps = {
  preview: false,
};


export default BoxEvents;
