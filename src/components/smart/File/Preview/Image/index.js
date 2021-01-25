import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import FILE_PROP_TYPES from 'constants/file/proptypes';


import makeStyles from '@material-ui/core/styles/makeStyles';
import { fade } from '@material-ui/core/styles';

import Grow from '@material-ui/core/Grow';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

// HELPERS
function round(value) {
  return Math.round(value * 1e5) / 1e5;
}

// HOOKS
const useStyles = makeStyles((theme) => ({
  image: ({ maxHeight, objectFit }) => ({
    borderRadius: theme.shape.borderRadius,
    maxWidth: '100%',
    maxHeight,
    objectFit,
  }),
  tooltipPaper: {
    display: 'none',
    position: 'absolute',
    top: 0,
    backgroundColor: fade(theme.palette.common.black, 0.5),
    borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    color: theme.palette.common.white,
    fontFamily: theme.typography.fontFamily,
    padding: '4px 8px',
    fontSize: theme.typography.pxToRem(10),
    lineHeight: `${round(14 / 10)}em`,
    width: '100%',
    wordWrap: 'break-word',
    fontWeight: theme.typography.fontWeightMedium,
  },
  imageBox: {
    '&:hover': {
      '& > $tooltipPaper': {
        display: 'block',
      },
    },
  },
}));

// COMPONENTS
function ImagePreview({ file, fallbackView, maxHeight, width, height, titleOnHover, objectFit }) {
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
    name,
  } = useMemo(() => file, [file]);

  const hasError = useMemo(
    () => initialError || hasInternalError,
    [hasInternalError, initialError],
  );

  const displayPreview = useMemo(
    () => !hasError && !isFetching,
    [hasError, isFetching],
  );

  useEffect(
    () => () => {
      setHasInternalError(false);
    },
    [file],
  );

  return (
    <>
      {displayPreview && (
        <Grow in={isLoaded} timeout={400}>
          <Box className={classes.imageBox} display="flex" justifyContent="center" position="relative">
            <img
              className={classes.image}
              src={blobUrl}
              alt={isLoaded ? name : null}
              onLoad={onLoad}
              onError={onError}
              height={height}
              width={isLoaded ? width : 0}
            />
            {titleOnHover && (
              <Paper
                classes={{ root: classes.tooltipPaper }}
                square
              >
                {name}
              </Paper>
            )}
          </Box>
        </Grow>
      )}

      {(!isLoaded || hasError) && fallbackView}
    </>
  );
}

ImagePreview.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  objectFit: PropTypes.oneOf(['fill', 'contain', 'cover', 'none', 'scale-down']),
  titleOnHover: PropTypes.bool,
};

ImagePreview.defaultProps = {
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  fallbackView: null,
  objectFit: 'scale-down',
  titleOnHover: false,
};


export default ImagePreview;
