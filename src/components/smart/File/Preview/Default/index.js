import React, { useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFileContext } from 'components/smart/File/Context';
import isNil from '@misakey/helpers/isNil';
import Grow from '@material-ui/core/Grow';
import { THEMES } from '@misakey/ui/theme';

// HOOKS
const useStyles = makeStyles((theme) => ({
  embed: {
    // cannot change text color in embed, black on grey is not readable
    backgroundColor: theme.palette.type === THEMES.DARK
      ? theme.palette.reverse
      : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  embedSize: ({ isLoaded }) => (isLoaded ? {
    width: '80vw',
    margin: theme.spacing(1, 0),
    height: '80vh',
  } : {
    width: 0,
    height: 0,
  }),
}));

// COMPONENTS
function DefaultPreview({ fallbackView }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const classes = useStyles({ isLoaded });

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const {
    blobUrl,
    isLoading: isFetching,
    error,
    fileName,
    fileType,
  } = useFileContext();

  const hasError = useMemo(() => !isNil(error), [error]);

  const displayDefault = useMemo(
    () => hasError || !isLoaded,
    [hasError, isLoaded],
  );

  const displayPreview = useMemo(
    () => !hasError && !isFetching,
    [hasError, isFetching],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%" height="inherit">
      {displayPreview && (
        <Grow in={isLoaded} timeout={400}>
          <embed
            title={fileName}
            className={clsx(classes.embed, classes.embedSize)}
            src={blobUrl}
            type={fileType}
            onLoad={onLoad}
          />
        </Grow>

      )}
      {displayDefault && fallbackView}
    </Box>
  );
}

DefaultPreview.propTypes = {
  fallbackView: PropTypes.node,
};

DefaultPreview.defaultProps = {
  fallbackView: null,
};

export default DefaultPreview;
