import { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MuiDialogTitle from '@material-ui/core/DialogTitle';

import CloseIcon from '@material-ui/icons/Close';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: ({ gutterBottom }) => ({
    margin: gutterBottom ? theme.spacing(1, 2, 7, 2) : theme.spacing(1, 2),
    padding: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...theme.mixins.toolbar, // apply toolbar minHeight rules
  }),
  typographyRoot: {
    margin: theme.spacing(1),
  },
}));

// COMPONENTS
const DialogTitleWithCloseIcon = ({
  children, className, classes, title, onClose, icon, t,
  fullScreen, gutterBottom,
  ...rest
}) => {
  const internalClasses = useStyles({ gutterBottom });

  const dialogFullScreen = useDialogFullScreen();

  const hasOnClose = useMemo(
    () => isFunction(onClose),
    [onClose],
  );

  const Icon = useMemo(
    () => {
      if (!isNil(icon)) {
        return icon;
      }
      return (fullScreen || dialogFullScreen) ? ArrowBackIcon : CloseIcon;
    },
    [fullScreen, dialogFullScreen, icon],
  );

  return (
    <MuiDialogTitle
      disableTypography
      className={clsx(className, internalClasses.root, classes.root)}
      {...omitTranslationProps(rest)}
    >
      <Box display="flex" width="100%" minHeight="inherit" alignItems="center">
        {hasOnClose && (
          <IconButton classes={{ root: classes.iconButton }} edge="start" aria-label={t('common:close')} onClick={onClose}>
            <Icon />
          </IconButton>
        )}
        {children}
      </Box>
      {title && (
        <Typography classes={{ root: clsx(internalClasses.typographyRoot, classes.title) }} variant="h6">{title}</Typography>
      )}
    </MuiDialogTitle>
  );
};

DialogTitleWithCloseIcon.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  classes: PropTypes.shape({
    root: PropTypes.string,
    iconButton: PropTypes.string,
    title: PropTypes.string,
  }),
  fullScreen: PropTypes.bool,
  gutterBottom: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogTitleWithCloseIcon.defaultProps = {
  title: null,
  children: null,
  onClose: null,
  icon: null,
  className: '',
  classes: {},
  fullScreen: false,
  gutterBottom: false,
};

export default withTranslation('common')(DialogTitleWithCloseIcon);
