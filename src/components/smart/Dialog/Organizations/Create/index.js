import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { conflict } from '@misakey/core/api/constants/errorTypes';
import { organizationCreateSchema } from 'constants/validationSchemas/organizations';

import isFunction from '@misakey/core/helpers/isFunction';
import { createOrganizationBuilder } from '@misakey/core/api/helpers/builder/organizations';
import { getCode } from '@misakey/core/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import { useTranslation } from 'react-i18next';

import Dialog from '@material-ui/core/Dialog';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import DialogOrganizationsCreateContent from 'components/smart/Dialog/Organizations/Create/Content';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import makeStyles from '@material-ui/core/styles/makeStyles';

// CONSTANTS
const INITIAL_VALUES = {
  name: '',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogTitleRoot: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    margin: theme.spacing(0),
    padding: theme.spacing(0, 2),
  },
  dialogTitleTitle: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  dialogTitleIconButton: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
}));

// COMPONENTS
const DialogOrganizationsCreate = ({ onClose, onSuccess, ...props }) => {
  const { t } = useTranslation('organizations');
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const handleHttpErrors = useHandleHttpErrors();

  const onResetFormik = useCallback(
    (e, { resetForm }) => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  const onSubmitOrganization = useCallback(
    async (form, { setFieldError }) => {
      try {
        const response = await createOrganizationBuilder(form);
        if (isFunction(onSuccess)) {
          return Promise.resolve(onSuccess(response));
        }
        return Promise.resolve(response);
      } catch (e) {
        const code = getCode(e);
        if (code === conflict) {
          return setFieldError('name', 'conflict');
        }
        return handleHttpErrors(e);
      }
    },
    [onSuccess, handleHttpErrors],
  );

  return (
    <Dialog
      fullWidth
      onClose={onClose}
      {...props}
    >
      <Formik
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmitOrganization}
        validationSchema={organizationCreateSchema}
      >
        <Form>
          <DialogTitleWithCloseFormik
            classes={{
              root: classes.dialogTitleRoot,
              title: classes.dialogTitleTitle,
              iconButton: classes.dialogTitleIconButton,
            }}
            onClose={onResetFormik}
            fullScreen={fullScreen}
            title={t('organizations:create')}
          />
          <AppBarStatic
            color="primary"
          />
          <DialogOrganizationsCreateContent />
        </Form>
      </Formik>
    </Dialog>
  );
};

DialogOrganizationsCreate.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DialogOrganizationsCreate.defaultProps = {
  open: false,
  onSuccess: null,
};

export default DialogOrganizationsCreate;
