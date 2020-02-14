import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import BoxControls from 'components/dumb/Box/Controls';
import ConfirmDialogContent from './DialogContent';


function ConfirmationDialog({
  onConfirm, isDialogOpen, setDialogOpen,
  dialogContent, title,
  confirmButtonText, hideCancelButton,
  t,
  ...rest
}) {
  const handleCancel = useCallback(
    () => { setDialogOpen(false); },
    [setDialogOpen],
  );

  const text = useMemo(
    () => (isNil(confirmButtonText) ? t('common:ok') : confirmButtonText),
    [confirmButtonText, t],
  );

  const secondary = useMemo(
    () => (hideCancelButton ? null : {
      onClick: handleCancel,
      text: t('common:cancel'),
    }),
    [hideCancelButton, handleCancel, t],
  );

  const { wrappedFetch: handleOk, isFetching: isValidating } = useFetchCallback(
    onConfirm,
    { onSuccess: handleCancel },
  );

  return (
    <Dialog
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={isDialogOpen}
      {...omitTranslationProps(rest)}
    >
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      <ConfirmDialogContent content={dialogContent} />
      <DialogActions>
        <BoxControls
          primary={{
            autoFocus: true,
            onClick: handleOk,
            isLoading: isValidating,
            text,
          }}
          secondary={secondary}
          outlined={false}
        />
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
  hideCancelButton: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
  confirmButtonText: null,
  hideCancelButton: false,
};

export default withTranslation(['common'])(ConfirmationDialog);
