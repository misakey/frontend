import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import CardSimpleText from 'components/dumb/Card/Simple/Text';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import exportCrypto from '@misakey/crypto/store/actions/exportCrypto';

import { usePasswordPrompt } from 'components/dumb/PasswordPrompt';

const ExportButton = ({ t }) => {
  const fileNamePrefix = t('account:exportCrypto.exportButton.fileName');

  const openPasswordPrompt = usePasswordPrompt();
  const dispatch = useDispatch();

  const onClick = useCallback(
    () => dispatch(exportCrypto(fileNamePrefix, openPasswordPrompt)),
    [dispatch, fileNamePrefix, openPasswordPrompt],
  );

  return (
    <CardSimpleText
      text={t('account:exportCrypto.exportButton.info')}
      button={{
        standing: BUTTON_STANDINGS.TEXT,
        text: t('common:download'),
        onClick,
      }}
    />
  );
};

ExportButton.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account', 'common'])(ExportButton);
