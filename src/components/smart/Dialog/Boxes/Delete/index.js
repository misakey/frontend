import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Form, Field } from 'formik';

import { ACCESS_RM, ACCESS_BULK } from 'constants/app/boxes/events';
import BoxesSchema from 'store/schemas/Boxes';
import { boxDeletionDialogValidationSchema } from 'constants/validationSchemas/boxes';

import { deleteBoxBuilder, createBulkBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxAccessesEffect from 'hooks/useBoxAccesses/effect';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

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
  const fullScreen = useDialogFullScreen();

  const { id, accesses } = useSafeDestr(box);

  const { isFetching } = useBoxAccessesEffect(box, open);

  const onDeleteSuccess = useCallback(
    () => (isFunction(onSuccess) ? onSuccess() : Promise.resolve()),
    [onSuccess],
  );

  const onSubmit = useCallback(
    (form) => {
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
          .then(onDeleteSuccess)
          .catch(handleHttpErrors));
    },
    [handleHttpErrors, onDeleteSuccess, id, accesses],
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
        title={t('boxes:delete.dialog.title', { title: box.title })}
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
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:delete'),
                  disabled: isFetching,
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
  // withTranslation
  t: PropTypes.func.isRequired,
};

DeleteBoxDialog.defaultProps = {
  onSuccess: null,
};

export default withTranslation(['boxes', 'common'])(DeleteBoxDialog);
