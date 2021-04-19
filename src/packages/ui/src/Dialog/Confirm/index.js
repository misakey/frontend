import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import stopPropagation from '@misakey/core/helpers/event/stopPropagation';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import ConfirmDialogContent from './DialogContent';

// CONSTANTS
export const PROP_TYPES = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  irreversible: PropTypes.bool,
  children: PropTypes.node,
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
};

// COMPONENTS
function DialogConfirm({
  onConfirm, open, onClose, onSuccess,
  title, children,
  confirmButtonText,
  irreversible,
  t,
  ...rest
}) {
  const fullScreen = useDialogFullScreen();

  const text = useMemo(
    () => (isNil(confirmButtonText) ? t('common:ok') : confirmButtonText),
    [confirmButtonText, t],
  );

  const handleSuccess = useCallback(
    () => {
      if (isFunction(onClose)) {
        onClose();
      }
      if (isFunction(onSuccess)) {
        onSuccess();
      }
    },
    [onClose, onSuccess],
  );

  const { wrappedFetch: onClick, isFetching: isValidating } = useFetchCallback(
    onConfirm,
    { onSuccess: handleSuccess },
  );

  return (
    <Dialog
      maxWidth="sm"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      onClick={stopPropagation}
      {...omitTranslationProps(rest)}
    >
      <DialogTitleWithClose title={title} onClose={onClose} />
      <ConfirmDialogContent>
        {children}
        <DialogActions>
          <BoxControlsDialog
            primary={{
              autoFocus: true,
              onClick,
              isLoading: isValidating,
              text,
            }}
            irreversible={irreversible}
          />
        </DialogActions>
      </ConfirmDialogContent>
    </Dialog>
  );
}

DialogConfirm.propTypes = PROP_TYPES;

DialogConfirm.defaultProps = {
  irreversible: false,
  confirmButtonText: null,
  title: null,
  onSuccess: null,
  children: null,
};

export default withTranslation(['common'])(DialogConfirm);
