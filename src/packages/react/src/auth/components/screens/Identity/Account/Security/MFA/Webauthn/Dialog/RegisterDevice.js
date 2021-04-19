import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import getRandomTitle from '@misakey/core/helpers/getRandomTitle';
import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import FormField from '@misakey/ui/Form/Field';
import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';

import Dialog from '@material-ui/core/Dialog';
import { webauthnDeviceValidationSchema } from '@misakey/react/auth/constants/validationSchemas/identity';

// CONSTANTS
const FIELD_DEVICE_NAME = 'name';

const DESCRIPTION_ID = 'register-device-dialog-description';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
  },
  prewrap: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
}));

function RegisterDeviceDialog({ onClose, open, onSubmit, ...props }) {
  const classes = useStyles();
  const [placeholder, setPlaceholder] = useState();
  const { t } = useTranslation('account');

  const fullScreen = useDialogFullScreen();

  useEffect(
    () => {
      setPlaceholder(getRandomTitle());
    },
    [open],
  );


  const onSubmitForm = useCallback(
    (form, { resetForm }) => {
      const { [FIELD_DEVICE_NAME]: name } = form;
      onSubmit(name || placeholder);
      onClose();
      resetForm();
    },
    [onClose, onSubmit, placeholder],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-label={t('account:security.MFA.webauthn.registerDeviceDialog.title')}
      aria-describedby={DESCRIPTION_ID}
      {...omitTranslationProps(props)}
    >
      <Formik
        validationSchema={webauthnDeviceValidationSchema}
        initialValues={{ [FIELD_DEVICE_NAME]: '' }}
        onSubmit={onSubmitForm}
      >
        <Form>
          <DialogTitleWithCloseFormik title={t('account:security.MFA.webauthn.registerDeviceDialog.title')} onClose={onClose} />
          <DialogContent
            classes={{ root: classes.dialogContentRoot }}
            subtitle={<Subtitle className={classes.prewrap}>{t('account:security.MFA.webauthn.registerDeviceDialog.subtitle')}</Subtitle>}
          >
            <FormField
              component={FormFieldTextFieldWithErrors}
              name={FIELD_DEVICE_NAME}
              placeholder={placeholder}
              label={t('account:security.MFA.webauthn.registerDeviceDialog.label')}
              autoFocus
              type="text"
            />
            <BoxControlsDialog
              mt={1}
              primary={{
                type: 'submit',
                text: t('common:save'),
              }}
              formik
            />
          </DialogContent>
        </Form>
      </Formik>
    </Dialog>
  );
}

RegisterDeviceDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

RegisterDeviceDialog.defaultProps = {
  open: false,
};

export default RegisterDeviceDialog;
