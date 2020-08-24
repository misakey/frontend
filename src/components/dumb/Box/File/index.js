import React, { useMemo } from 'react';
import { PropTypes } from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import formatFileSize from 'helpers/formatFileSize';
import isNil from '@misakey/helpers/isNil';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';


const useStyles = makeStyles((theme) => ({
  icons: ({ isLarge }) => ({
    color: theme.palette.text.secondary,
    fontSize: isLarge ? '8rem' : '2rem',
  }),
}));

function BoxFile(
  { fileName, fileSize, fileType, text, typographyProps, textContainerProps, isLarge, ...rest },
) {
  const classes = useStyles({ isLarge });

  const formattedSize = useMemo(
    () => (!isNil(fileSize) ? formatFileSize(fileSize) : null),
    [fileSize],
  );

  const FileIcon = useGetFileIconFromType(fileType);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={3}
      {...rest}
    >
      <FileIcon className={classes.icons} />
      <Box display="flex" flexDirection="column" {...textContainerProps}>
        <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{fileName}</Typography>
        <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{formattedSize}</Typography>
        {!isNil(text) && (
          <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{text}</Typography>
        )}
      </Box>
    </Box>
  );
}

BoxFile.propTypes = {
  fileName: PropTypes.string.isRequired,
  fileType: PropTypes.string,
  fileSize: PropTypes.number,
  text: PropTypes.string,
  typographyProps: PropTypes.object,
  textContainerProps: PropTypes.object,
  isLarge: PropTypes.bool,
};

BoxFile.defaultProps = {
  text: null,
  fileSize: null,
  fileType: null,
  typographyProps: {},
  textContainerProps: {},
  isLarge: false,
};

export default BoxFile;
