import PropTypes from 'prop-types';

const TrackersSchema = {
  name: PropTypes.string,
  mainDomain: PropTypes.string,
  blocked: PropTypes.bool,
};

export default TrackersSchema;
