import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';
import routes from 'routes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Button from '@misakey/ui/Button';

// COMPONENTS
const ButtonGoBackTo = ({ className, to, t, text, ...props }) => (
  <Button
    component={Link}
    to={to}
    className={className}
    text={text || t('common:goBack')}
    {...omitTranslationProps(props)}
  />
);

ButtonGoBackTo.propTypes = {
  className: PropTypes.string,
  to: TO_PROP_TYPE,
  text: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ButtonGoBackTo.defaultProps = {
  className: '',
  to: routes._,
  text: null,
};

export default withTranslation('common')(ButtonGoBackTo);
