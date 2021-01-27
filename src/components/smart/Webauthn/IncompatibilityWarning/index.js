import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxMessage from '@misakey/ui/Box/Message';

const WebauthnIncompatibilityWarning = () => {
  const { t } = useTranslation(['components']);

  const isCompatible = useMemo(
    () => 'credentials' in navigator,
    [],
  );

  if (isCompatible) {
    return null;
  }

  return (
    <BoxMessage text={t('components:WebauthnIncompatibilityWarning.text')} type="warning" />
  );
};

WebauthnIncompatibilityWarning.propTypes = {

};

export default WebauthnIncompatibilityWarning;
