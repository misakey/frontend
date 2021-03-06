import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import IconButton from '@material-ui/core/IconButton';
import Title from '@misakey/ui/Typography/Title';
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
    flexDirection: 'row',
    alignItems: 'center',
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
  id,
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
          <IconButton
            classes={{ root: classes.iconButton }}
            edge="start"
            aria-label={t('common:close')}
            onClick={onClose}
          >
            <Icon />
          </IconButton>
        )}
        {title && (
          <Title
            id={id}
            gutterBottom={false}
            classes={{ root: clsx(internalClasses.typographyRoot, classes.title) }}
          >
            {title}
          </Title>
        )}
        {children}
      </Box>
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
  // useful for aria-X
  id: PropTypes.string,
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
  id: null,
};

export default withTranslation('common')(DialogTitleWithCloseIcon);
