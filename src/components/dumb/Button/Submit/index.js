import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';

import Button from 'components/dumb/Button/index';

const ButtonSubmit = ({ isSubmitting, t, text, ...rest }) => (
  <Button
    type="submit"
    variant="contained"
    color="secondary"
    isLoading={isSubmitting}
    text={text || t('submit', 'Submit')}
    {...omit(rest, ['i18n', 'tReady'])}
  />
);

ButtonSubmit.propTypes = {
  isSubmitting: PropTypes.bool,
  t: PropTypes.func,
  text: PropTypes.string,
};

ButtonSubmit.defaultProps = {
  isSubmitting: false,
  t: tDefault,
  text: '',
};

export default withTranslation()(ButtonSubmit);
