
import { useCallback } from 'react';
import PropTypes from 'prop-types';

import BlobListItem from 'components/dumb/ListItem/Blob';


// COMPONENTS
const FieldBlobs = ({ onRemove, blob, index, uploadStatus }) => {
  const handleRemove = useCallback(
    () => onRemove(index),
    [onRemove, index],
  );

  return (
    <BlobListItem
      blob={blob}
      onRemove={handleRemove}
      uploadStatus={uploadStatus}
    />
  );
};

FieldBlobs.propTypes = {
  onRemove: PropTypes.func.isRequired,
  blob: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  uploadStatus: PropTypes.object,
};

FieldBlobs.defaultProps = {
  uploadStatus: undefined,
};

export default FieldBlobs;
