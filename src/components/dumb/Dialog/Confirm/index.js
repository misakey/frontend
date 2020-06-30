import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import BoxControls from '@misakey/ui/Box/Controls';
import ConfirmDialogContent from './DialogContent';


function ConfirmationDialog({
  onConfirm, isDialogOpen, onClose,
  dialogContent, title,
  confirmButtonText,
  t,
  ...rest
}) {
  const fullScreen = useDialogFullScreen();

  const text = useMemo(
    () => (isNil(confirmButtonText) ? t('common:ok') : confirmButtonText),
    [confirmButtonText, t],
  );

  const { wrappedFetch: handleOk, isFetching: isValidating } = useFetchCallback(
    onConfirm,
    { onSuccess: onClose },
  );

  return (
    <Dialog
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={isDialogOpen}
      fullScreen={fullScreen}
      onClose={onClose}
      {...omitTranslationProps(rest)}
    >
      <DialogTitleWithClose onClose={onClose}>
        {title}
      </DialogTitleWithClose>
      <ConfirmDialogContent content={dialogContent} />
      <DialogActions>
        <BoxControls
          primary={{
            autoFocus: true,
            onClick: handleOk,
            isLoading: isValidating,
            text,
          }}
        />
      </DialogActions>
    </Dialog>
  );
}

ConfirmationDialog.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isDialogOpen: PropTypes.bool.isRequired,
  dialogContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  confirmButtonText: null,
  title: null,
};

export default withTranslation(['common'])(ConfirmationDialog);
