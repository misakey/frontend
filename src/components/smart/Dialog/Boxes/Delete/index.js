import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import { Form, Field } from 'formik';

import { ACCESS_RM, ACCESS_BULK } from '@misakey/core/api/constants/boxes/events';
import BoxesSchema from 'store/schemas/Boxes';
import { boxDeletionDialogValidationSchema } from 'constants/validationSchemas/boxes';

import { deleteBoxBuilder, createBulkBoxEventBuilder, getBoxAccessesBuilder } from '@misakey/core/api/helpers/builder/boxes';
import isFunction from '@misakey/core/helpers/isFunction';
import isEmpty from '@misakey/core/helpers/isEmpty';


import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import FormFieldTextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Formik from '@misakey/ui/Formik';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import Box from '@material-ui/core/Box';
import DialogActions from '@material-ui/core/DialogActions';

// CONSTANTS
export const FIELD_NAME = 'confirm';

const INITIAL_VALUES = {
  [FIELD_NAME]: '',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    margin: theme.spacing(2, 0),
  },
}));

function DeleteBoxDialog({ box, open, onClose, onSuccess }) {
  const classes = useStyles();
  const { t } = useTranslation(['boxes', 'common']);
  const handleHttpErrors = useHandleHttpErrors();
  const fullScreen = useDialogFullScreen();

  const { id, title } = useSafeDestr(box);

  const handleSuccess = useCallback(
    () => {
      onClose();
      if (isFunction(onSuccess)) {
        return onSuccess();
      }
      return Promise.resolve();
    },
    [onClose, onSuccess],
  );

  const onFetchAccesses = useCallback(
    () => getBoxAccessesBuilder(id),
    [id],
  );

  const onSubmit = useCallback(
    async (form) => {
      const accesses = await onFetchAccesses();
      const events = (accesses || []).map(({ id: referrerId }) => ({
        type: ACCESS_RM,
        referrerId,
      }));
      return (isEmpty(events)
        ? Promise.resolve()
        : createBulkBoxEventBuilder(id, {
          batchType: ACCESS_BULK,
          events,
        }))
        .then(() => deleteBoxBuilder(id, form[FIELD_NAME])
          .then(handleSuccess)
          .catch(handleHttpErrors));
    },
    [onFetchAccesses, id, handleSuccess, handleHttpErrors],
  );

  const confirmValue = useMemo(
    () => t('boxes:delete.dialog.confirmValue'),
    [t],
  );

  const validationSchema = useMemo(
    () => boxDeletionDialogValidationSchema(confirmValue),
    [confirmValue],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitleWithClose
        fullScreen={fullScreen}
        onClose={onClose}
        title={t('boxes:delete.dialog.title', { title })}
      />
      <DialogContent className={classes.dialogContentRoot}>
        <TypographyPreWrapped>
          {t('boxes:delete.dialog.description')}
        </TypographyPreWrapped>
        <Formik
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          initialValues={INITIAL_VALUES}
        >
          <Form>
            <Box display="flex" justifyContent="center">
              <Field
                component={FormFieldTextField}
                inputProps={{ autoComplete: 'off' }}
                className={classes.inputField}
                name={FIELD_NAME}
                prefix="delete_"
                autoFocus
                id="confirm"
                type="text"
                variant="filled"
                placeholder={confirmValue}
              />
            </Box>
            <DialogActions>
              <BoxControlsDialog
                primary={{
                  type: 'submit',
                  text: t('common:delete'),
                }}
                irreversible
                formik
              />
            </DialogActions>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

DeleteBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeleteBoxDialog.defaultProps = {
  onSuccess: null,
};

export default DeleteBoxDialog;
