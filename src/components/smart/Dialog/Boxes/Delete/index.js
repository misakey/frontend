import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Form, Field } from 'formik';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { updatePaginationsToStatus } from 'store/reducers/userBoxes/pagination';
import { removeEntities } from '@misakey/store/actions/entities';
import { removeBoxSecretKeys } from '@misakey/crypto/store/actions/concrete';
import { boxDeletionDialogValidationSchema } from 'constants/validationSchemas/boxes';

import { deleteBoxBuilder } from '@misakey/helpers/builder/boxes';
import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Formik from '@misakey/ui/Formik';
import BoxControls from '@misakey/ui/Box/Controls';
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

function DeleteBoxDialog({ box, t, open, onClose, onSuccess }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const { id, publicKey } = useSafeDestr(box);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKeysWeCanDecryptFrom, publicKey],
  );

  const onDeleteSuccess = useCallback(
    () => {
      const promise = isFunction(onSuccess) ? onSuccess : Promise.resolve;
      return promise().then(() => Promise.all([
        dispatch(removeEntities([{ id }], BoxesSchema)),
        dispatch(updatePaginationsToStatus(id, CLOSED)),
      ])
        .then(() => Promise.resolve(dispatch(removeBoxSecretKeys([secretKey]))))
        .catch(() => {
          enqueueSnackbar(t('boxes:delete.error.updateBackup'), { variant: 'error' });
        })
        .finally(() => {
          enqueueSnackbar(t('boxes:delete.success'), { variant: 'success' });
        }));
    },
    [id, secretKey, dispatch, enqueueSnackbar, onSuccess, t],
  );

  const onSubmit = useCallback(
    (form, { setSubmitting }) => deleteBoxBuilder(id, form[FIELD_NAME])
      .then(onDeleteSuccess)
      .catch(handleHttpErrors)
      .finally(() => setSubmitting(false)),
    [handleHttpErrors, onDeleteSuccess, id],
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
    >
      <DialogTitleWithClose onClose={onClose} />
      <DialogContent className={classes.dialogContentRoot}>
        <TypographyPreWrapped>
          {t('boxes:delete.dialog.description', { title: box.title })}
        </TypographyPreWrapped>
        <Formik
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          initialValues={INITIAL_VALUES}
        >
          <Form>
            <Box display="flex" justifyContent="center">
              <Field
                component={FieldTextStandard}
                inputProps={{ autocomplete: 'off' }}
                className={classes.inputField}
                name={FIELD_NAME}
                prefix="delete_"
                autoFocus
                id="confirm"
                type="text"
                placeholder={confirmValue}
              />
            </Box>
            <DialogActions className={classes.dialogActionsRoot}>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:delete'),
                }}
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
  t: PropTypes.func.isRequired,
  open: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeleteBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(DeleteBoxDialog);
