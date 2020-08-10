import React, { useMemo } from 'react';
import { PropTypes } from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import formatFileSize from 'helpers/formatFileSize';
import isNil from '@misakey/helpers/isNil';

import DefaultIcon from '@material-ui/icons/InsertDriveFile';
import ImageIcon from '@material-ui/icons/Image';
import VideoIcon from '@material-ui/icons/Videocam';
import PdfIcon from '@material-ui/icons/PictureAsPdf';


const useStyles = makeStyles((theme) => ({
  icons: ({ isLarge }) => ({
    color: theme.palette.grey[300],
    fontSize: isLarge ? '8rem' : '2rem',
  }),
}));

function BoxFile({ fileName, fileSize, fileType, text, typographyProps, isLarge, ...rest }) {
  const classes = useStyles({ isLarge });

  const formattedSize = useMemo(
    () => (!isNil(fileSize) ? formatFileSize(fileSize) : null),
    [fileSize],
  );

  const FileIcon = useMemo(() => {
    if (isNil(fileType)) { return DefaultIcon; }
    if (fileType === 'application/pdf') { return PdfIcon; }
    if (fileType.startsWith('image')) { return ImageIcon; }
    if (fileType.startsWith('video')) { return VideoIcon; }
    return DefaultIcon;
  }, [fileType]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={3}
      {...rest}
    >
      <FileIcon className={classes.icons} />
      <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{fileName}</Typography>
      <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{formattedSize}</Typography>
      {!isNil(text) && (
      <Typography variant="caption" align="center" color="textSecondary" {...typographyProps}>{text}</Typography>
      )}
    </Box>
  );
}

BoxFile.propTypes = {
  fileName: PropTypes.string.isRequired,
  fileType: PropTypes.string,
  fileSize: PropTypes.number,
  text: PropTypes.string,
  typographyProps: PropTypes.object,
  isLarge: PropTypes.bool,
};

BoxFile.defaultProps = {
  text: null,
  fileSize: null,
  fileType: null,
  typographyProps: {},
  isLarge: false,
};

export default BoxFile;
