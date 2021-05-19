import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { gone } from '@misakey/core/api/constants/errorTypes';

import { createDeleteBoxEventBuilder } from 'helpers/builder/boxes';
import { getCode } from '@misakey/core/helpers/apiError';
import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// COMPONENTS
const DialogEventDelete = ({
  boxId, eventId, onDelete,
  onClose, open,
  t,
  ...rest
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const onConfirm = useCallback(
    () => createDeleteBoxEventBuilder({ boxId, referrerId: eventId })
      .then((response) => {
        if (isFunction(onDelete)) {
          return onDelete(response);
        }
        return Promise.resolve();
      })
      .catch((error) => {
        const code = getCode(error);
        if (code === gone) {
          enqueueSnackbar(t('boxes:read.events.gone'), { variant: 'warning' });
        } else {
          handleHttpErrors(error);
        }
      }),
    [boxId, eventId, onDelete, enqueueSnackbar, handleHttpErrors, t],
  );

  return (
    <DialogConfirm
      onConfirm={onConfirm}
      open={open}
      onClose={onClose}
      confirmButtonText={t('common:delete')}
      title={t('boxes:read.events.delete.title')}
      irreversible
      {...omitTranslationProps(rest)}
    />
  );
};

DialogEventDelete.propTypes = {
  boxId: PropTypes.string.isRequired,
  eventId: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogEventDelete.defaultProps = {
  onDelete: null,
};

export default withTranslation('boxes')(DialogEventDelete);
