import { useMemo } from 'react';
import { PropTypes } from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

import formatFileSize from 'helpers/formatFileSize';
import isNil from '@misakey/helpers/isNil';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';
import { useTranslation } from 'react-i18next';


const useStyles = makeStyles((theme) => ({
  icons: ({ isLarge }) => ({
    color: theme.palette.text.secondary,
    fontSize: isLarge ? '8rem' : '4rem',
  }),
}));

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
  ...rest
}) {
  const classes = useStyles({ isLarge });
  const { t } = useTranslation();

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
};

export default BoxFile;
