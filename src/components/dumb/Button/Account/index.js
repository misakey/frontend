import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { withTranslation } from 'react-i18next';

import Button from '@misakey/ui/Button';
import LinkAccount from 'components/dumb/Link/Account';

const ButtonAccount = forwardRef(({ t, ...props }, ref) => (
  <Button
    component={LinkAccount}
    ref={ref}
    text={t('components:buttonAccount.profile')}
    {...omitTranslationProps(props)}
  />
));

ButtonAccount.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('components')(ButtonAccount);
