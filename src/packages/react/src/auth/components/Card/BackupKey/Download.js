import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import useDownloadBackupKey from '@misakey/react/crypto/hooks/useDownloadBackupKey';

import IconButtonWithDialogPassword from '@misakey/react/auth/components/Dialog/Password/with/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import DownloadIcon from '@material-ui/icons/GetApp';

// COMPONENTS
const CardDownloadBackupKey = ({ t }) => {
  const fileNamePrefix = t('account:vault.exportButton.fileName');

  const onClick = useDownloadBackupKey(fileNamePrefix);

  return (
    <ListBordered disablePadding>
      <ListItem>
        <ListItemText
          primary={t('account:vault.exportButton.info')}
        />
        <ListItemSecondaryAction>
          <IconButtonWithDialogPassword
            onClick={onClick}
            forceDialog
          >
            <DownloadIcon />
          </IconButtonWithDialogPassword>
        </ListItemSecondaryAction>
      </ListItem>
    </ListBordered>
  );
};

CardDownloadBackupKey.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account', 'common'])(CardDownloadBackupKey);
