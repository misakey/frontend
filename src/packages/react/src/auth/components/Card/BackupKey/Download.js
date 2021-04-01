import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import useDownloadBackupKey from '@misakey/react/crypto/hooks/useDownloadBackupKey';

import CardSimpleText from '@misakey/ui/Card/Simple/Text';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonWithDialogPassword from '@misakey/react/auth/components/Dialog/Password/with/Button';

// COMPONENTS
const CardDownloadBackupKey = ({ t }) => {
  const fileNamePrefix = t('account:vault.exportButton.fileName');

  const onClick = useDownloadBackupKey(fileNamePrefix);

  return (
    <CardSimpleText
      text={t('account:vault.exportButton.info')}
      button={(
        <ButtonWithDialogPassword
          standing={BUTTON_STANDINGS.TEXT}
          text={t('common:download')}
          onClick={onClick}
          forceDialog
        />
      )}
    />
  );
};

CardDownloadBackupKey.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account', 'common'])(CardDownloadBackupKey);
