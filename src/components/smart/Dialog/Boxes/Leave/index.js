import { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';

import { createLeaveBoxEventBuilder } from 'helpers/builder/boxes';
import { getCode } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useHistory } from 'react-router-dom';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// CONSTANTS
const { forbidden } = errorTypes;

// COMPONENTS
function LeaveBoxDialog({ box, t, open, onClose, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const { replace } = useHistory();

  const { id, title } = useSafeDestr(box);

  const onConfirm = useCallback(
    () => createLeaveBoxEventBuilder(id)
      .catch((e) => {
        const code = getCode(e);
        if (code === forbidden) {
          enqueueSnackbar(t('boxes:leave.error.forbidden'), { variant: 'warning' });
          replace(routes.boxes._);
        } else {
          handleHttpErrors(e);
        }
      }),
    [handleHttpErrors, enqueueSnackbar, t, id, replace],
  );

  return (
    <DialogConfirm
      isDialogOpen={open}
      onConfirm={onConfirm}
      onClose={onClose}
      onSuccess={onSuccess}
      confirmButtonText={t('common:leave')}
    >
      {t('boxes:leave.dialog.description', { title })}
    </DialogConfirm>
  );
}

LeaveBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

LeaveBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(LeaveBoxDialog);
