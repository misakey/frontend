import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';

import { useFormikContext } from 'formik';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// NB: this component expects to be wrapped in a formik context
const ButtonSubmit = ({
  component: Component,
  t,
  text, isLoading,
  ...rest
}) => {
  const { isSubmitting } = useFormikContext();

  return (
    <Component
      type="submit"
      standing={BUTTON_STANDINGS.MAIN}
      isLoading={isSubmitting || isLoading}
      text={text || t('common:submit', 'Submit')}
      {...omit(rest, ['i18n', 'tReady'])}
    />
  );
};

ButtonSubmit.propTypes = {
  component: PropTypes.elementType,
  text: PropTypes.string,
  isLoading: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ButtonSubmit.defaultProps = {
  component: Button,
  text: '',
  isLoading: false,
};

export default withTranslation('common')(ButtonSubmit);
