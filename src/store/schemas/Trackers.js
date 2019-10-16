import PropTypes from 'prop-types';

const TrackersSchema = {
  name: PropTypes.string,
  domain: PropTypes.string,
  detected: PropTypes.arrayOf(PropTypes.shape({
    blocked: PropTypes.bool,
    count: PropTypes.number,
    url: PropTypes.string,
  })),
};

export default TrackersSchema;
