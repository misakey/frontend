import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Link } from 'react-router-dom';


import omit from '@misakey/helpers/omit';
import isString from '@misakey/helpers/isString';
import isBoolean from '@misakey/helpers/isBoolean';
import isObject from '@misakey/helpers/isObject';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import merge from '@misakey/helpers/merge';

import useWidth from '@misakey/hooks/useWidth';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles((theme) => ({
  root: {
    borderBottom: '1px solid #dadce0',
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

// HELPERS
const getLocationState = prop('state');

// HOOKS
const useWithLocationState = (path, locationState) => useMemo(
  () => {
    if (isNil(locationState)) {
      return path;
    }
    if (isObject(path)) {
      return merge({}, path, { state: locationState });
    }
    if (isNil(path)) {
      return path;
    }
    return { pathname: path, state: locationState };
  },
  [path, locationState],
);

const Navigation = forwardRef(({
  appBarProps,
  children,
  className,
  gutterBottom,
  history,
  location,
  goBackPath,
  noWrap,
  pushPath,
  showGoBack,
  t,
  title,
  toolbarProps,
  ...rest
}, ref) => {
  const classes = useStyles();
  const width = useWidth();
  const showTitle = useMemo(() => isString(title), [title]);

  const locationState = useMemo(() => getLocationState(location), [location]);

  const pushPathWithState = useWithLocationState(pushPath, locationState);

  const goBackPathWithState = useWithLocationState(goBackPath, locationState);

  const handleNavigation = useCallback(
    () => {
      if (isObject(history)) {
        const { length, goBack, push } = history;
        if (!isNil(pushPathWithState)) {
          push(pushPathWithState);
        } else if (length > 1) {
          goBack();
        } else if (!isNil(goBackPathWithState)) {
          push(goBackPathWithState);
        }
      }
    },
    [history, pushPathWithState, goBackPathWithState],
  );

  const targetPath = useMemo(
    () => pushPathWithState || goBackPathWithState,
    [pushPathWithState, goBackPathWithState],
  );

  const linkProps = useMemo(
    () => {
      if (isObject(history)) {
        return {
          onClick: handleNavigation,
          onKeyPress: handleNavigation,
        };
      }
      return {
        component: Link,
        to: targetPath,
      };
    },
    [history, handleNavigation, targetPath],
  );

  return (
    <AppBar
      ref={ref}
      position="static"
      elevation={0}
      color="inherit"
      className={clsx(
        className,
        classes.root,
        { [classes.gutterBottom]: appBarProps.gutterBottom || gutterBottom },
      )}
      {...omit(rest, ['i18n', 'tReady'])}
      {...appBarProps}
    >
      <Toolbar component={Container} disableGutters {...toolbarProps}>
        {(isBoolean(showGoBack) ? showGoBack : width === 'xs') && (
          <IconButton
            edge="start"
            color="inherit"
            className={classes.backButton}
            aria-label={t('navigation.backButton', 'Go back')}
            {...linkProps}
          >
            <ArrowBack />
          </IconButton>
        )}
        {showTitle && (
          <Typography
            component="h1"
            variant="h5"
            className={classes.title}
            noWrap={noWrap}
          >
            {title}
          </Typography>
        )}
        {children}
      </Toolbar>
    </AppBar>
  );
});

Navigation.propTypes = {
  /**
   * The width of the button
   *
   * @deprecated Do not use! Use props propagation instead!
   */
  appBarProps: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  className: PropTypes.string,
  goBackPath: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  noWrap: PropTypes.bool,
  gutterBottom: PropTypes.bool,
  history: PropTypes.shape({
    goBack: PropTypes.func,
    length: PropTypes.number,
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.object,
  }),
  pushPath: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /**
   * null enable the dynamic display rule (width === 'xs)
   */
  showGoBack: PropTypes.oneOf([true, false, null]),
  t: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  toolbarProps: PropTypes.object,
};

Navigation.defaultProps = {
  appBarProps: {},
  children: null,
  className: '',
  gutterBottom: true,
  history: null,
  location: null,
  goBackPath: '/',
  noWrap: false,
  pushPath: null,
  showGoBack: true,
  title: '',
  toolbarProps: {},
};

export default withTranslation('common', { withRef: true })(Navigation);
