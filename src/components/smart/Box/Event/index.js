import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import BoxMessageEvent from 'components/dumb/Event/Box/Message';
import BoxInformationEvent from 'components/dumb/Event/Box/Information';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import withIdentity from 'components/smart/withIdentity';

import EVENTS_TYPE from 'constants/app/boxes/events';
import IdentitySchema from 'store/schemas/Identity';

function BoxEvents({ event, identity, preview }) {
  const isFromCurrentUser = useMemo(
    () => identity.identifier.value === event.sender.identifier.value,
    [event.sender.identifier.value, identity.identifier.value],
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
        isFromCurrentUser={isFromCurrentUser}
        preview={preview}
      />
    );
  }
  return null;
}

BoxEvents.propTypes = {
  preview: PropTypes.bool,
  identity: PropTypes.shape(IdentitySchema.propTypes),
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,

};

BoxEvents.defaultProps = {
  preview: false,
  identity: null,
};


export default withIdentity(BoxEvents);
