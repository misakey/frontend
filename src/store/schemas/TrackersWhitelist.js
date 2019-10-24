import PropTypes from 'prop-types';

const TrackersWhitelistSchema = {
  apps: PropTypes.arrayOf(PropTypes.string),
  mainPurposes: PropTypes.shape({
    [PropTypes.string]: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default TrackersWhitelistSchema;
