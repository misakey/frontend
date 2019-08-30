import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import useWidth from '@misakey/hooks/useWidth';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(2),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

// @FIXME appy changes to handleGoBack on js-common
function Navigation({
  appBarProps, children, hideBackButton, history, pushPath, t, title,
}) {
  const classes = useStyles();
  const width = useWidth();

  // @FIXME appy changes to handleGoBack on js-common
  function handleGoBack() {
    if (history.length < 2) {
      history.push(pushPath);
    } else { history.goBack(); }
  }

  function isBackButtonVisible() {
    if (typeof hideBackButton === 'boolean') { return !hideBackButton; }

    return width === 'xs';
  }

  return (
    <div className={classes.root}>
      <AppBar {...appBarProps}>
        <Toolbar>
          {isBackButtonVisible() && (
            <IconButton
              edge="start"
              className={classes.backButton}
              color="inherit"
              aria-label={t('navigation.backButton', 'Go back')}
              onClick={handleGoBack}
              onKeyPress={handleGoBack}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          {children}
        </Toolbar>
      </AppBar>
    </div>
  );
}

Navigation.propTypes = {
  appBarProps: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  hideBackButton: PropTypes.bool,
  history: PropTypes.shape({
    goBack: PropTypes.func,
    push: PropTypes.func,
    length: PropTypes.number,
  }).isRequired,
  pushPath: PropTypes.string,
  t: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

Navigation.defaultProps = {
  appBarProps: {
    color: 'default',
    elevation: 0,
    position: 'static',
  },
  children: null,
  hideBackButton: null,
  pushPath: '/',
  title: '',
};

export default withTranslation()(Navigation);
