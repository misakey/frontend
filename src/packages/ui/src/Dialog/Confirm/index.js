import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import BoxControls from '@misakey/ui/Box/Controls';
import ConfirmDialogContent from './DialogContent';

// COMPONENTS
function ConfirmationDialog({
  onConfirm, isDialogOpen, onClose, onSuccess,
  title, children,
  confirmButtonText,
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
      onClose();
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
      open={isDialogOpen}
      fullScreen={fullScreen}
      onClose={onClose}
      {...omitTranslationProps(rest)}
    >
      <DialogTitleWithClose title={title} onClose={onClose} />
      <ConfirmDialogContent>{children}</ConfirmDialogContent>
      <DialogActions>
        <BoxControls
          primary={{
            autoFocus: true,
            onClick,
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
  onSuccess: PropTypes.func,
  isDialogOpen: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
  confirmButtonText: null,
  title: null,
  onSuccess: null,
};

export default withTranslation(['common'])(ConfirmationDialog);
