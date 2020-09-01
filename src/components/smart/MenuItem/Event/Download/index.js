import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import downloadFile from '@misakey/helpers/downloadFile';

import useGetDecryptedFileCallback from 'hooks/useGetDecryptedFile/callback';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import DownloadIcon from '@material-ui/icons/GetApp';

// COMPONENTS
const MenuItemDownloadEvent = forwardRef(({ t, encryptedFileId, encryption, fileName }, ref) => {
  const onGetDecryptedFile = useGetDecryptedFileCallback({ encryptedFileId, encryption, fileName });

  const onClick = useCallback(
    () => {
      onGetDecryptedFile()
        .then((file) => {
          downloadFile(file, file.name);
        });
    },
    [onGetDecryptedFile],
  );

  return (
    <ContextMenuItem ref={ref} onClick={onClick}>
      <ListItemIcon>
        <DownloadIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:download')} />
    </ContextMenuItem>
  );
});

MenuItemDownloadEvent.propTypes = {
  fileName: PropTypes.string,
  encryption: PropTypes.object,
  encryptedFileId: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemDownloadEvent.defaultProps = {
  encryption: null,
  fileName: 'Untitled',
};

export default withTranslation('common', { withRef: true })(MenuItemDownloadEvent);
