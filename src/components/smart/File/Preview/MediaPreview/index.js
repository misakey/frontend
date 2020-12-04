import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import isNil from '@misakey/helpers/isNil';
import makeStyles from '@material-ui/core/styles/makeStyles';
import BoxFile from 'components/dumb/Box/File';
import FILE_PROP_TYPES from 'constants/file/proptypes';

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
function MediaPreview({ file, fallbackView, maxHeight }) {
  const classes = useStyles({ maxHeight });

  const {
    blobUrl,
    isLoading,
    error,
    type,
    size,
    name,
  } = useMemo(() => file, [file]);

  const hasError = useMemo(() => !isNil(error), [error]);

  const displayPreview = useMemo(
    () => !hasError && !isLoading,
    [hasError, isLoading],
  );

  const nilFileType = useMemo(
    () => isNil(type),
    [type],
  );

  const isAudio = useMemo(
    () => !nilFileType && type.startsWith('audio'),
    [nilFileType, type],
  );

  const preview = useMemo(() => {
    if (isAudio) {
      return (
        <Box className={classes.container}>
          {fallbackView || (
            <BoxFile
              fileSize={size}
              fileName={name}
              fileType={type}
              isBroken={!isNil(error)}
              isLarge
              typographyProps={{ variant: 'body1' }}
            />
          )}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls className={classes.media}>
            <source src={blobUrl} type={type} />
          </audio>
        </Box>
      );
    }

    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video controls className={classes.media}>
        <source src={blobUrl} type={type} />
        {fallbackView}
      </video>
    );
  }, [blobUrl, classes.container, classes.media, error, fallbackView, isAudio, name, size, type]);


  return (
    <Box display="flex" flexDirection="column">
      {displayPreview ? preview : fallbackView}
    </Box>
  );
}

MediaPreview.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.string,
};

MediaPreview.defaultProps = {
  maxHeight: '100%',
  fallbackView: null,
};

export default MediaPreview;
