import React, { useMemo } from 'react';

import { PropTypes } from 'prop-types';

import formatFileSize from '@misakey/ui/helpers/formatFileSize';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import DownloadIcon from '@material-ui/icons/GetApp';

// HOOKS
const useStyles = makeStyles((theme) => ({
  icons: ({ isLarge }) => ({
    color: theme.palette.text.secondary,
    fontSize: isLarge ? '8rem' : '4rem',
  }),
}));

// COMPONENTS
function BoxFile({
  fileName,
  fileSize,
  fileType,
  isBroken,
  isLoading,
  text,
  typographyProps,
  textContainerProps,
  isLarge,
  onDownload,
  ...rest
}) {
  const classes = useStyles({ isLarge });
  const { t } = useTranslation(['components', 'common']);

  const formattedSize = useMemo(
    () => (!isNil(fileSize) ? formatFileSize(fileSize) : null),
    [fileSize],
  );

  const FileIcon = useGetFileIconFromType(fileType, isBroken);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={3}
      {...rest}
    >
      {isLoading
        ? <HourglassEmptyIcon className={classes.icons} />
        : <FileIcon className={classes.icons} />}
      <Box display="flex" flexDirection="column" {...textContainerProps}>
        <Typography variant="body2" align="center" color="textSecondary" {...typographyProps}>{fileName}</Typography>
        <Typography variant="body2" align="center" color="textSecondary" {...typographyProps}>{formattedSize}</Typography>
        {!isNil(text) && (
          <Typography variant="body2" align="center" color="textSecondary" {...typographyProps}>{text}</Typography>
        )}
        {isBroken && (
          <Typography variant="body2" align="center" color="textSecondary" {...typographyProps}>
            {t('components:filePreview.errors.noFile')}
          </Typography>
        )}
      </Box>
      {!isBroken && isFunction(onDownload) && (
        <Box mt={0.5}>
          <Fab
            aria-label={t('common:download')}
            variant="extended"
            onClick={onDownload}
          >
            <DownloadIcon />
            {t('common:download')}
          </Fab>
        </Box>
      )}
    </Box>
  );
}

BoxFile.propTypes = {
  fileName: PropTypes.node.isRequired,
  fileType: PropTypes.string,
  fileSize: PropTypes.number,
  text: PropTypes.string,
  typographyProps: PropTypes.object,
  textContainerProps: PropTypes.object,
  isLarge: PropTypes.bool,
  isBroken: PropTypes.bool,
  isLoading: PropTypes.bool,
  onDownload: PropTypes.func,
};

BoxFile.defaultProps = {
  text: null,
  fileSize: null,
  fileType: null,
  typographyProps: {},
  textContainerProps: {},
  isLarge: false,
  isBroken: false,
  isLoading: false,
  onDownload: null,
};

export default BoxFile;
