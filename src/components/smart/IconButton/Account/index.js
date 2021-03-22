import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@misakey/ui/IconButton';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';

// COMPONENTS
const IconButtonAccount = forwardRef((props, ref) => {
  const { t } = useTranslation('common');

  return (
    <IconButton
      ref={ref}
      aria-label={t('common:openAccount')}
      edge="start"
      size="small"
      {...props}
    >
      <UserAccountAvatar size="small" />
    </IconButton>
  );
});

export default IconButtonAccount;
