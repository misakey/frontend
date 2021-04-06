import React from 'react';

import PropTypes from 'prop-types';

import JoinButton from 'components/smart/Menu/Notifications/Misakey/Actions/BoxInvitationButton/JoinButton';
import SeeButton from 'components/smart/Menu/Notifications/Misakey/Actions/BoxInvitationButton/SeeButton';

// COMPONENTS
const BoxInvitationButton = ({ notification: { id, details }, ...rest }) => (
  details.used
    ? <SeeButton id={id} details={details} {...rest} />
    : <JoinButton id={id} details={details} {...rest} />
);

BoxInvitationButton.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string,
    details: PropTypes.object,
  }).isRequired,
};

export default BoxInvitationButton;
