import { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';
import { LIFECYCLE } from 'constants/app/boxes/events';
import { removeEntities } from '@misakey/store/actions/entities';
import errorTypes from '@misakey/ui/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// CONSTANTS
const { conflict } = errorTypes;

// COMPONENTS
function CloseBoxDialog({ box, t, open, onClose, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const { id, title } = useSafeDestr(box);

  const onConfirm = useCallback(
    () => createBoxEventBuilder(id, { type: LIFECYCLE, content: { state: CLOSED } })
      .catch((error) => {
        if (error.code === conflict) {
          const { details = {} } = error;
          if (details.lifecycle === conflict) {
            dispatch(removeEntities([{ id }], BoxesSchema));
            enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
          }
        } else {
          handleHttpErrors(error);
        }
      }),
    [dispatch, enqueueSnackbar, handleHttpErrors, id, t],
  );

  return (
    <DialogConfirm
      isDialogOpen={open}
      onConfirm={onConfirm}
      onClose={onClose}
      onSuccess={onSuccess}
      confirmButtonText={t('common:close')}
    >
      {t('boxes:close.dialog.description', { title })}
    </DialogConfirm>
  );
}

CloseBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

CloseBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(CloseBoxDialog);
