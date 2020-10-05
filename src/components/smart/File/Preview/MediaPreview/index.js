import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import { useFileContext } from 'components/smart/File/Context';
import isNil from '@misakey/helpers/isNil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import BoxFile from 'components/dumb/Box/File';

// HOOKS
const useStyles = makeStyles((theme) => ({
  media: ({ maxHeight }) => ({
    maxWidth: '100%',
    maxHeight,
  }),
  container: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.white,
    borderRadius: theme.shape.borderRadius,
  },
}));

// COMPONENTS
function MediaPreview({ fallbackView, maxHeight }) {
  const classes = useStyles({ maxHeight });

  const {
    blobUrl,
    isLoading,
    error,
    fileType,
    fileSize,
    fileName,
  } = useFileContext();

  const hasError = useMemo(() => !isNil(error), [error]);

  const displayPreview = useMemo(
    () => !hasError && !isLoading,
    [hasError, isLoading],
  );

  const nilFileType = useMemo(
    () => isNil(fileType),
    [fileType],
  );

  const isAudio = useMemo(
    () => !nilFileType && fileType.startsWith('audio'),
    [nilFileType, fileType],
  );

  const preview = useMemo(() => {
    if (isAudio) {
      return (
        <Box className={classes.container}>
          {fallbackView || (
            <BoxFile
              fileSize={fileSize}
              fileName={fileName}
              fileType={fileType}
              isBroken={!isNil(error)}
              isLarge
              typographyProps={{ variant: 'body1' }}
            />
          )}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls className={classes.media}>
            <source src={blobUrl} type={fileType} />
          </audio>
        </Box>
      );
    }

    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video controls className={classes.media}>
        <source src={blobUrl} type={fileType} />
        {fallbackView}
      </video>
    );
  }, [blobUrl, classes, error, fallbackView, fileName, fileSize, fileType, isAudio]);


  return (
    <Box display="flex" flexDirection="column">
      {displayPreview ? preview : fallbackView}
    </Box>
  );
}

MediaPreview.propTypes = {
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.string,
};

MediaPreview.defaultProps = {
  maxHeight: '100%',
  fallbackView: null,
};

export default MediaPreview;
