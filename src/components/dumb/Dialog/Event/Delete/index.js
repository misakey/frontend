import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import errorTypes from '@misakey/ui/constants/errorTypes';

import { deleteBoxEventBuilder } from 'helpers/boxEvent';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// CONSTANTS
const { conflict, gone } = errorTypes;

// COMPONENTS
const DialogEventDelete = ({
  boxId, eventId, onDelete,
  onClose, isDialogOpen,
  t,
  ...rest
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const onConfirm = useCallback(
    () => deleteBoxEventBuilder({ boxId, eventId })
      .then((response) => {
        enqueueSnackbar(t('boxes:read.events.delete.success'), { variant: 'success' });
        if (isFunction(onDelete)) {
          return onDelete(response);
        }
        return Promise.resolve();
      })
      .catch((error) => {
        const code = getCode(error);
        const { lifecycle } = getDetails(error);
        if (code === gone) {
          enqueueSnackbar(t('boxes:read.events.gone'), { variant: 'warning' });
        } else if (code === conflict && lifecycle === conflict) {
          enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
        } else {
          handleHttpErrors(error);
        }
      })
      .finally(onClose),
    [boxId, eventId, onDelete, enqueueSnackbar, handleHttpErrors, onClose, t],
  );

  return (
    <DialogConfirm
      onConfirm={onConfirm}
      isDialogOpen={isDialogOpen}
      onClose={onClose}
      confirmButtonText={t('common:delete')}
      {...omitTranslationProps(rest)}
    >
      {t('boxes:read.events.delete.confirmDialog')}
    </DialogConfirm>
  );
};

DialogEventDelete.propTypes = {
  boxId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  isDialogOpen: PropTypes.bool.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogEventDelete.defaultProps = {
  onDelete: null,
};

export default withTranslation('boxes')(DialogEventDelete);
