import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { invalid } from '@misakey/core/api/constants/errorTypes';
import IdentitySchema from '@misakey/react-auth/store/schemas/Identity';

import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';
import BoxControls from '@misakey/ui/Box/Controls';


// CONSTANTS
const INITIAL_VALUES = { email: '' };
const NO_ERROR = {};
const EMAIL_INVALID_ERROR = { email: invalid };

// COMPONENTS
const DeleteAccountDialog = ({ onClose, onSuccess, open, identity, t }) => {
  const validate = useCallback(
    (values) => (values.email.toLowerCase() !== identity.displayName.toLowerCase()
      ? EMAIL_INVALID_ERROR
      : NO_ERROR),
    [identity],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Formik
        onSubmit={onSuccess}
        initialValues={INITIAL_VALUES}
        validate={validate}
      >
        <Form>
          <DialogTitle id="alert-dialog-title">
            {t('account:delete.dialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {t('account:delete.dialog.description', { email: identity.displayName })}
            </DialogContentText>
            <Field
              component={FormFieldTextFieldWithErrors}
              name="email"
              variant="filled"
              autoFocus
              id="email-address"
              fullWidth
              label={t('fields:email.label')}
              placeholder={identity.displayName || t('fields:email.placeholder')}
            />
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:delete'),
              }}
              secondary={{
                text: t('common:cancel'),
                onClick: onClose,
              }}
              irreversible
              formik
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

DeleteAccountDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  identity: PropTypes.shape(IdentitySchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'fields'])(DeleteAccountDialog);
