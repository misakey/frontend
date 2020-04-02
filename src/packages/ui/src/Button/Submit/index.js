import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';

import { useFormikContext } from 'formik';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// NB: this component expects to be wrapped in a formik context
const ButtonSubmit = ({ t, text, ...rest }) => {
  const { isSubmitting } = useFormikContext();

  return (
    <Button
      type="submit"
      standing={BUTTON_STANDINGS.MAIN}
      isLoading={isSubmitting}
      text={text || t('common:submit', 'Submit')}
      {...omit(rest, ['i18n', 'tReady'])}
    />
  );
};

ButtonSubmit.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
};

ButtonSubmit.defaultProps = {
  text: '',
};

export default withTranslation('common')(ButtonSubmit);
