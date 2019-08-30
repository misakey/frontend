import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import tDefault from '@misakey/helpers/tDefault';
import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowBack from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
  marginRight: theme.spacing(2),
}));
// @FIXME update js-common component to have IconButtonGoBack and ButtonGoBack
function ButtonGoBack({ children, className, history, pushPath, t, ...rest }) {
  const classes = useStyles();

  const content = useMemo(() => (isNil(children) ? <ArrowBack /> : children), [children]);

  function handleGoBack() {
    if (!history.goBack()) {
      history.push(pushPath);
    }
  }

  return (
    <Button
      {...omit(rest, ['i18N', 'tReady'])}
      className={clsx(className, classes)}
      aria-label={t('navigation:history.goBack', 'Go back')}
      onClick={handleGoBack}
      onKeyPress={handleGoBack}
    >
      {content}
    </Button>
  );
}

ButtonGoBack.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]),
  className: PropTypes.string,
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func }).isRequired,
  pushPath: PropTypes.string,
  t: PropTypes.func,
};

ButtonGoBack.defaultProps = {
  children: null,
  className: '',
  pushPath: '/',
  t: tDefault,
};

export default withTranslation()(ButtonGoBack);
