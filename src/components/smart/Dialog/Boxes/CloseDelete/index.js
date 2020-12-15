import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Form, Field } from 'formik';

import { CLOSED } from 'constants/app/boxes/statuses';
import { LIFECYCLE } from 'constants/app/boxes/events';
import errorTypes from '@misakey/ui/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';
import { boxDeletionDialogValidationSchema } from 'constants/validationSchemas/boxes';
import { removeEntities } from '@misakey/store/actions/entities';

import { createBoxEventBuilder, deleteBoxBuilder } from '@misakey/helpers/builder/boxes';

import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import FormFieldTextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
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
const { conflict } = errorTypes;

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
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useSafeDestr(box);

  const onDeleteSuccess = useCallback(
    () => {
      const promise = isFunction(onSuccess) ? onSuccess : Promise.resolve;
      return promise();
    },
    [onSuccess],
  );

  const onSubmit = useCallback(
    (form, { setSubmitting }) => createBoxEventBuilder(
      id,
      { type: LIFECYCLE, content: { state: CLOSED } },
    )
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
      }).then(() => deleteBoxBuilder(id, form[FIELD_NAME])
        .then(onDeleteSuccess)
        .catch(handleHttpErrors)
        .finally(() => setSubmitting(false))),
    [dispatch, enqueueSnackbar, handleHttpErrors, onDeleteSuccess, id, t],
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
                component={FormFieldTextField}
                inputProps={{ autoComplete: 'off' }}
                className={classes.inputField}
                name={FIELD_NAME}
                prefix="delete_"
                autoFocus
                id="confirm"
                type="text"
                placeholder={confirmValue}
                variant="filled"
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
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DeleteBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(DeleteBoxDialog);
