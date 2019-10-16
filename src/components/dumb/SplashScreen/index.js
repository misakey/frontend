import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'components/dumb/SplashScreen/SplashScreen.scss';

const SplashScreen = ({ t, text, translated, children }) => (
  <div className="splashScreen">
    <div className="svg-container">
      {children || <CircularProgress size={50} />}
      <Typography>{(text && (translated ? text : t(text))) || t('loading')}</Typography>
    </div>
  </div>
);

SplashScreen.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
  children: PropTypes.node,
  translated: PropTypes.bool,
};


SplashScreen.defaultProps = {
  text: null,
  children: null,
  translated: false,
};

export default withTranslation()(SplashScreen);
