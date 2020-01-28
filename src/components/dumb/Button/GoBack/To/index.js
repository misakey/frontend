import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';

import omitTranslationProps from 'helpers/omit/translationProps';

import Button from 'components/dumb/Button';

// CONSTANTS
const DEFAULT_TEXT_KEY = 'common:navigation.history.goBack';

// COMPONENTS
const ButtonGoBackTo = ({ className, to, t, text, ...props }) => (
  <Button
    component={Link}
    to={to}
    className={className}
    text={text || t(DEFAULT_TEXT_KEY)}
    {...omitTranslationProps(props)}
  />
);

ButtonGoBackTo.propTypes = {
  className: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  text: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ButtonGoBackTo.defaultProps = {
  className: '',
  to: routes._,
  text: null,
};

export default withTranslation('common')(ButtonGoBackTo);
