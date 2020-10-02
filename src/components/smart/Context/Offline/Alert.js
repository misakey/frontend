import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useOfflineContext } from 'components/smart/Context/Offline';

import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const OfflineAlert = ({ t, ...props }) => {
  const { offlineError } = useOfflineContext();

  const onClick = useCallback(
    () => {
      window.location.reload();
    },
    [],
  );

  if (isNil(offlineError)) {
    return null;
  }

  return (
    <Box
      component={Alert}
      severity="error"
      action={(
        <Button
          standing={BUTTON_STANDINGS.OUTLINED}
          onClick={onClick}
          text={t('common:refresh')}
        />
      )}
      {...omitTranslationProps(props)}
    >
      {t('components:offline.alert')}
    </Box>
  );
};

OfflineAlert.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['components', 'common'])(OfflineAlert);
