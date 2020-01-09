import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';

import ConfirmDialogContent from './DialogContent';


function ConfirmationDialog({
  onConfirm, isDialogOpen, setDialogOpen,
  dialogContent, title, confirmButtonText, t,
  ...rest
}) {
  const [isValidating, setValidating] = useState(false);
  const handleCancel = useCallback(
    () => { setDialogOpen(false); },
    [setDialogOpen],
  );

  const handleOk = useCallback(
    () => {
      setValidating(true);
      if (Promise.resolve(onConfirm) === onConfirm) {
        Promise.resolve(onConfirm)
          .then(() => {
            setDialogOpen(false);
            setValidating(false);
          });
      } else {
        onConfirm();
        setDialogOpen(false);
        setValidating(false);
      }
    },
    [setDialogOpen, onConfirm, setValidating],
  );

  return (
    <Dialog
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={isDialogOpen}
      {...omit(rest, ['i18n', 'tReady'])}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <ConfirmDialogContent content={dialogContent} />
      <DialogActions>
        <Button onClick={handleCancel} color="primary">
          {t('cancel')}
        </Button>
        <Button autoFocus onClick={handleOk} color="secondary" disabled={isValidating}>
          {(isNil(confirmButtonText)) ? t('ok') : confirmButtonText }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  setDialogOpen: PropTypes.func.isRequired,
  isDialogOpen: PropTypes.bool.isRequired,
  dialogContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  title: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  confirmButtonText: null,
};

export default withTranslation(['common'])(ConfirmationDialog);
