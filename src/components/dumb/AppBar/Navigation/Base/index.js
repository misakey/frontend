import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';


import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import isBoolean from '@misakey/helpers/isBoolean';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Title from 'components/dumb/Typography/Title';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles((theme) => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  gutterBottom: {
    marginBottom: theme.spacing(3),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const AppBarNavigationBase = forwardRef(({
  children,
  className,
  gutterBottom,
  noWrap,
  showGoBack,
  t,
  title,
  toolbarProps,
  buttonProps,
  ...rest
}, ref) => {
  const classes = useStyles();
  const theme = useTheme();
  const isXsLayout = useMediaQuery(theme.breakpoints.only('xs'));
  const showTitle = useMemo(() => !isEmpty(title), [title]);

  return (
    <AppBar
      ref={ref}
      position="static"
      elevation={0}
      color="inherit"
      className={clsx(
        className,
        classes.root,
        { [classes.gutterBottom]: gutterBottom },
      )}
      {...omit(rest, ['i18n', 'tReady'])}
    >
      <Toolbar component={Container} disableGutters {...toolbarProps}>
        {(isBoolean(showGoBack) ? showGoBack : isXsLayout) && (
          <IconButton
            edge="start"
            color="inherit"
            className={classes.backButton}
            aria-label={t('common:navigation.backButton', 'Go back')}
            {...buttonProps}
          >
            <ArrowBack />
          </IconButton>
        )}
        {showTitle && (
          <Title
            noWrap={noWrap}
            className={classes.title}
            gutterBottom={false}
          >
            {title}
          </Title>
        )}
        {children}
      </Toolbar>
    </AppBar>
  );
});

AppBarNavigationBase.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  className: PropTypes.string,
  noWrap: PropTypes.bool,
  gutterBottom: PropTypes.bool,
  /**
   * null enable the dynamic display rule (isXsLayout)
   */
  showGoBack: PropTypes.oneOf([true, false, null]),
  t: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  toolbarProps: PropTypes.object,
  buttonProps: PropTypes.object,
};

AppBarNavigationBase.defaultProps = {
  children: null,
  className: '',
  gutterBottom: true,
  noWrap: true,
  showGoBack: true,
  title: '',
  toolbarProps: {},
  buttonProps: {},
};

export default withTranslation('common', { withRef: true })(AppBarNavigationBase);
