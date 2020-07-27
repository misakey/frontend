
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
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
  root: {
    margin: theme.spacing(1, 2),
    padding: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  typographyRoot: {
    margin: theme.spacing(1),
  },
}));

// COMPONENTS
const DialogTitleWithCloseIcon = ({ children, title, onClose, icon, t, ...rest }) => {
  const classes = useStyles();

  const fullScreen = useDialogFullScreen();

  const hasOnClose = useMemo(
    () => isFunction(onClose),
    [onClose],
  );

  const Icon = useMemo(
    () => {
      if (!isNil(icon)) {
        return icon;
      }
      return fullScreen ? ArrowBackIcon : CloseIcon;
    },
    [fullScreen, icon],
  );

  return (
    <MuiDialogTitle disableTypography className={classes.root} {...omitTranslationProps(rest)}>
      <Box display="flex" width="100%">
        {hasOnClose && (
          <IconButton edge="start" aria-label={t('common:close')} onClick={onClose}>
            <Icon />
          </IconButton>
        )}
        {children}
      </Box>
      {title && (
        <Typography classes={{ root: classes.typographyRoot }} variant="h6">{children}</Typography>
      )}
    </MuiDialogTitle>
  );
};

DialogTitleWithCloseIcon.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  onClose: PropTypes.func,
  icon: PropTypes.elementType,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogTitleWithCloseIcon.defaultProps = {
  title: null,
  children: null,
  onClose: null,
  icon: null,
};

export default withTranslation('common')(DialogTitleWithCloseIcon);
