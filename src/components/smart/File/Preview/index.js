import { useMemo } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import FILE_PROP_TYPES from 'constants/file/proptypes';
import ImagePreview from './Image';
import MediaPreview from './MediaPreview';
import DefaultPreview from './Default';

// COMPONENTS
function FilePreview({
  file,
  allowedFileTypePreview,
  fallbackView,
  maxHeight, width, height, objectFit,
}) {
  const { type } = useMemo(() => file, [file]);

  const nilFileType = useMemo(
    () => isNil(type),
    [type],
  );

  const isTypeAllowedForPreview = useMemo(
    () => !nilFileType && allowedFileTypePreview.some((elem) => type.startsWith(elem)),
    [nilFileType, allowedFileTypePreview, type],
  );

  const isImage = useMemo(
    () => !nilFileType && type.startsWith('image'),
    [nilFileType, type],
  );

  const isAudio = useMemo(
    () => !nilFileType && type.startsWith('audio'),
    [nilFileType, type],
  );

  const isVideo = useMemo(
    () => !nilFileType && type.startsWith('video'),
    [nilFileType, type],
  );

  if (!isTypeAllowedForPreview) {
    return fallbackView;
  }

  if (isImage) {
    return (
      <ImagePreview
        file={file}
        fallbackView={fallbackView}
        maxHeight={maxHeight}
        height={height}
        width={width}
        objectFit={objectFit}
      />
    );
  }
  if (isAudio || isVideo) {
    return <MediaPreview file={file} fallbackView={fallbackView} maxHeight={maxHeight} />;
  }

  return <DefaultPreview file={file} fallbackView={fallbackView} />;
}


FilePreview.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  allowedFileTypePreview: PropTypes.arrayOf(PropTypes.string).isRequired,
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  objectFit: PropTypes.oneOf(['fill', 'contain', 'cover', 'none', 'scale-down']),
};

FilePreview.defaultProps = {
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  fallbackView: null,
  objectFit: 'scale-down',
};

export default FilePreview;
