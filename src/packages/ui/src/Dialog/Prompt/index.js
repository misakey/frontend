import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import { useTranslation } from 'react-i18next';

import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import BoxControls from '@misakey/ui/Box/Controls';

// COMPONENTS
const DialogPrompt = ({
  message, callback,
  open, onClose,
  ...props }) => {
  const { t } = useTranslation('common');

  const onCancel = useCallback(
    () => {
      if (isFunction(callback)) {
        callback(false);
      }
      if (isFunction(onClose)) {
        onClose();
      }
    },
    [callback, onClose],
  );

  const onConfirm = useCallback(
    () => {
      if (isFunction(callback)) {
        callback(true);
      }
      if (isFunction(onClose)) {
        onClose();
      }
    },
    [callback, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      {...props}
    >
      <DialogTitleWithClose
        onClose={onCancel}
        title={message}
      />
      <DialogContent>
        <DialogActions>
          <BoxControls
            primary={{
              text: t('common:confirm'),
              onClick: onConfirm,
            }}
            secondary={{
              text: t('common:cancel'),
              onClick: onCancel,
            }}
          />
        </DialogActions>

      </DialogContent>
    </Dialog>
  );
};

DialogPrompt.propTypes = {
  message: PropTypes.string,
  callback: PropTypes.func,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

DialogPrompt.defaultProps = {
  message: null,
  callback: null,
  open: false,
  onClose: null,
};

export default DialogPrompt;
