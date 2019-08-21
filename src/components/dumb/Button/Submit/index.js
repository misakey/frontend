import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';

import MKButtonSubmit from '@misakey/ui/Button/Submit';

const ButtonSubmit = ({ t, ...rest }) => (
  <MKButtonSubmit t={t} {...omit(rest, ['i18n', 'tReady'])} />
);

ButtonSubmit.propTypes = {
  t: PropTypes.func,
};

ButtonSubmit.defaultProps = {
  t: tDefault,
};

export default withTranslation()(ButtonSubmit);
