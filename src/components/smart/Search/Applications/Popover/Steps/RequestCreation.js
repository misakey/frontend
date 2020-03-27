import React from 'react';
import PropTypes from 'prop-types';

import NewRequest from 'components/smart/Requests/New';
import { REQUEST_TYPES } from 'constants/databox/type';

const TYPE = REQUEST_TYPES.portability;

// COMPONENTS
const RequestCreation = ({ producerId }) => <NewRequest type={TYPE} producerId={producerId} />;

RequestCreation.propTypes = {
  producerId: PropTypes.string.isRequired,
};

export default RequestCreation;
