import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { withTranslation } from 'react-i18next';

import Button from '@misakey/ui/Button';
import LinkAccount from 'components/smart/Link/Account';

const ButtonAccount = forwardRef(({ t, ...props }, ref) => (
  <Button
    ref={ref}
    text={t('components:buttonAccount.profile')}
    {...omitTranslationProps(props)}
  />
));

ButtonAccount.propTypes = {
  component: PropTypes.elementType,
  t: PropTypes.func.isRequired,
};

ButtonAccount.defaultProps = {
  component: LinkAccount,
};

export default withTranslation('components', { withRef: true })(ButtonAccount);
