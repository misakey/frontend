import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';

import Backdrop from '@material-ui/core/Backdrop';
import BoxFile from 'components/dumb/Box/File';

// CONSTANTS
const BOX_FILE_TYPO_PROPS = {
  variant: 'body1',
  noWrap: true,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  textContainerPreview: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.text.secondary,
    opacity: 0.8,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    maxWidth: '100%',
  },
}));


// COMPONENTS
const FilePreviewBackdrop = ({
  size, name, type,
  isLoading, isBroken,
  showFallback,
  ...props
}) => {
  const internalClasses = useStyles();
  const { t } = useTranslation('common');

  return (
    <Backdrop {...props}>
      {showFallback && (
        <BoxFile
          fileSize={size}
          fileName={name || t('common:loading')}
          fileType={type}
          isLoading={isLoading}
          isBroken={isBroken}
          isLarge
          maxWidth="100%"
          typographyProps={BOX_FILE_TYPO_PROPS}
          textContainerProps={{ className: internalClasses.textContainerPreview }}
        />
      )}
    </Backdrop>
  );
};


FilePreviewBackdrop.propTypes = {
  size: PropTypes.number,
  name: PropTypes.node,
  type: PropTypes.string,
  isLoading: PropTypes.bool,
  isBroken: PropTypes.bool,
  showFallback: PropTypes.bool,
};

FilePreviewBackdrop.defaultProps = {
  size: null,
  name: null,
  type: null,
  isLoading: false,
  isBroken: false,
  showFallback: false,
};

export default FilePreviewBackdrop;
