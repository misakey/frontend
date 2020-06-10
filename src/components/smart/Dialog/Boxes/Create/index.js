import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { normalize } from 'normalizr';
import { useDispatch } from 'react-redux';
import { generatePath, useHistory } from 'react-router-dom';
import routes from 'routes';

import BoxesSchema from 'store/schemas/Boxes';
import { updatePaginationsToStatus } from 'store/reducers/userBoxes/pagination';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import { makeStyles } from '@material-ui/core/styles/';
import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import BoxControls from '@misakey/ui/Box/Controls';
import FieldText from 'components/dumb/Form/Field/Text';
import { boxNameFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { createBoxBuilder } from '@misakey/helpers/builder/boxes';
import { OPEN } from 'constants/app/boxes/statuses';

export const FIELD_NAME = 'name';
export const INITIAL_VALUES = { [FIELD_NAME]: '' };

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 2),
    marginTop: theme.spacing(3),
  },
  dialogActionsRoot: {
    padding: theme.spacing(2),
  },
  inputField: { width: '70%', margin: theme.spacing(2, 0) },
  inputLabelRoot: {
    width: '100%',
    textAlign: 'center',
    '&:not(.Mui-focused)': {
      fontSize: '1.5rem',
      transform: 'translate(0, 12px) scale(1)',
    },
  },
  inputLabelShrink: { transformOrigin: 'top center' },
  input: {
    textAlign: 'center',
  },
}));

function CreateBoxDialog({
  t,
  onClose,
  open,
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const history = useHistory();
  const handleHttpErrors = useHandleHttpErrors();

  const onSuccess = useCallback(
    async (newBox) => {
      const { id, status = OPEN } = newBox;
      const normalized = normalize(
        newBox,
        BoxesSchema.entity,
      );
      const { entities } = normalized;
      await Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updatePaginationsToStatus(id, status)),
      ]);
      enqueueSnackbar(t('boxes:create.dialog.success'), { variant: 'success' });
      const nextTo = generatePath(routes.boxes.read._, { id });
      history.push(nextTo);
      onClose();
    },
    [dispatch, enqueueSnackbar, history, onClose, t],
  );

  const onSubmit = useCallback((form, { setSubmitting }) => {
    // @FIXME: generate public key
    const publicKey = 'test';
    return createBoxBuilder({ title: form[FIELD_NAME], publicKey })
      .then(onSuccess)
      .catch(handleHttpErrors)
      .finally(() => { setSubmitting(false); });
  }, [handleHttpErrors, onSuccess]);

  const getOnReset = useCallback(
    (resetForm) => () => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="create-box-dialog-title"
      aria-describedby="create-box-dialog-description"
    >
      <Formik
        validationSchema={boxNameFieldValidationSchema}
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <DialogTitleWithClose onClose={getOnReset(resetForm)} />
            <DialogContent className={classes.dialogContentRoot}>
              <Typography>{t('boxes:create.dialog.content')}</Typography>
              <Box display="flex" justifyContent="center">
                <Field
                  component={FieldText}
                  name={FIELD_NAME}
                  label={t('boxes:create.dialog.fields.name')}
                  prefix="boxes."
                  className={classes.inputField}
                  // autoFocus
                  id="BoxName"
                  type="text"
                  fullWidth={false}
                  variant="standard"
                  InputLabelProps={{
                    classes: {
                      root: classes.inputLabelRoot,
                      shrink: classes.inputLabelShrink,
                    },
                  }}
                  InputProps={{ classes: { root: classes.input } }}
                />
              </Box>
            </DialogContent>
            <DialogActions className={classes.dialogActionsRoot}>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:validate'),
                }}
                formik
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>

  );
}

CreateBoxDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

CreateBoxDialog.defaultProps = {
  open: false,
};

export default withTranslation(['common', 'boxes'])(CreateBoxDialog);
