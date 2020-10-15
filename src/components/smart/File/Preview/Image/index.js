import React, { useState, useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFileContext } from 'components/smart/File/Context';
import Grow from '@material-ui/core/Grow';

// HOOKS
const useStyles = makeStyles(() => ({
  image: ({ maxHeight, objectFit }) => ({
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxWidth: '100%',
    maxHeight,
    objectFit,
  }),
}));

// COMPONENTS
function ImagePreview({ fallbackView, maxHeight, width, height, objectFit }) {
  const [hasInternalError, setHasInternalError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const classes = useStyles({ maxHeight, objectFit });

  const onError = useCallback(
    () => {
      setHasInternalError(true);
      setIsLoaded(true);
    },
    [setHasInternalError, setIsLoaded],
  );

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const {
    blobUrl,
    isLoading: isFetching,
    error: initialError,
    fileName,
  } = useFileContext();

  const hasError = useMemo(
    () => initialError || hasInternalError,
    [hasInternalError, initialError],
  );

  const displayPreview = useMemo(
    () => !hasError && !isFetching,
    [hasError, isFetching],
  );

  return (
    <>
      {displayPreview && (
        <Grow in={isLoaded} timeout={400}>
          <img
            className={classes.image}
            src={blobUrl}
            alt={isLoaded ? fileName : null}
            onLoad={onLoad}
            onError={onError}
            height={height}
            width={isLoaded ? width : 0}
          />
        </Grow>
      )}

      {(!isLoaded || hasError) && fallbackView}
    </>
  );
}

ImagePreview.propTypes = {
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  objectFit: PropTypes.oneOf(['fill', 'contain', 'cover', 'none', 'scale-down']),
};

ImagePreview.defaultProps = {
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  fallbackView: null,
  objectFit: 'scale-down',
};


export default ImagePreview;
