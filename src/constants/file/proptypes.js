import PropTypes from 'prop-types';

const FILE_PROP_TYPES = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  blobFile: PropTypes.object,
  blobUrl: PropTypes.string,
  encryption: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
};
export default FILE_PROP_TYPES;
