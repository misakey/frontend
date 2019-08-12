import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
  marginRight: theme.spacing(2),
}));

/**
 * @FIXME add to @misakey/ui
 * @param className
 * @param history
 * @param pushPath
 * @param t
 * @returns {*}
 * @constructor
 */
function ButtonGoBack({ className, history, pushPath, t }) {
  const classes = useStyles();

  function handleGoBack() {
    if (!history.goBack()) {
      history.push(pushPath);
    }
  }

  return (
    <IconButton
      edge="start"
      className={clsx(className, classes)}
      color="inherit"
      aria-label={t('nav:history.goBack', 'Go back')}
      onClick={handleGoBack}
      onKeyPress={handleGoBack}
    >
      <ArrowBack />
    </IconButton>
  );
}

ButtonGoBack.propTypes = {
  className: PropTypes.string,
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func }).isRequired,
  pushPath: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ButtonGoBack.defaultProps = {
  className: '',
  pushPath: '/',
};

export default withRouter(withTranslation('nav')(ButtonGoBack));
