import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import SplashScreen from '@misakey/ui/Screen/Splash';

// COMPONENTS
const SplashScreenWithTranslation = ({ t, text, ...rest }) => (
  <SplashScreen
    text={text || t('common:loading')}
    {...omitTranslationProps(rest)}
  />
);

SplashScreenWithTranslation.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
};

SplashScreenWithTranslation.defaultProps = {
  text: null,
};

export default withTranslation('common')(SplashScreenWithTranslation);
