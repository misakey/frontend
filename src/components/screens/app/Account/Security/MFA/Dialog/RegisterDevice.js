import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import getRandomTitle from '@misakey/helpers/getRandomTitle';

import makeStyles from '@material-ui/core/styles/makeStyles';

import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import FormField from '@misakey/ui/Form/Field';
import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { webauthnDeviceValidationSchema } from 'constants/validationSchemas/identity';

// CONSTANTS
const FIELD_DEVICE_NAME = 'name';

const DESCRIPTION_ID = 'register-device-dialog-description';

// HOOKS
const useStyles = makeStyles(() => ({
  prewrap: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
}));

function RegisterDeviceDialog({ onClose, open, onSubmit, ...props }) {
  const classes = useStyles();
  const [placeholder, setPlaceholder] = useState();
  const { t } = useTranslation('account');

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
      open={open}
      onClose={onClose}
      aria-label={t('account:security.MFA.registerDeviceDialog.title')}
      aria-describedby={DESCRIPTION_ID}
      {...omitTranslationProps(props)}
    >
      <Formik
        validationSchema={webauthnDeviceValidationSchema}
        initialValues={{ [FIELD_DEVICE_NAME]: '' }}
        onSubmit={onSubmitForm}
      >
        <Form>
          <DialogTitleWithCloseFormik title={t('account:security.MFA.registerDeviceDialog.title')} onClose={onClose} />
          <DialogContent
            subtitle={<Subtitle className={classes.prewrap}>{t('account:security.MFA.registerDeviceDialog.subtitle')}</Subtitle>}
          >
            <FormField
              component={FormFieldTextFieldWithErrors}
              name={FIELD_DEVICE_NAME}
              placeholder={placeholder}
              label={t('account:security.MFA.registerDeviceDialog.label')}
              autoFocus
              type="text"
            />
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:save'),
              }}
              formik
            />
          </DialogActions>
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
