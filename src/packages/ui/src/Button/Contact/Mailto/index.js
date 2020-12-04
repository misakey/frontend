import { useMemo } from 'react';
import PropTypes from 'prop-types';

import isEmpty from '@misakey/helpers/isEmpty';

import { useTranslation } from 'react-i18next';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

const ButtonContactMailto = ({ email, ...props }) => {
  const { t } = useTranslation('common');

  const href = useMemo(
    () => (isEmpty(email) ? '' : `mailto:${email}`),
    [email],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.MAIN}
      text={t('common:contact')}
      component="a"
      href={href}
      {...props}
    />
  );
};

ButtonContactMailto.propTypes = {
  email: PropTypes.string.isRequired,
};

export default ButtonContactMailto;
