import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Formik, Form, Field } from 'formik';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FieldText from 'components/dumb/Form/Field/Text';
import BoxControls from 'components/dumb/Box/Controls';

import errorTypes from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const { invalid } = errorTypes;
const INITIAL_VALUES = { email: '' };
const NO_ERROR = {};
const EMAIL_INVALID_ERROR = { email: invalid };

// COMPONENTS
const DeleteAccountDialog = ({ onClose, onSuccess, open, profile, t }) => {
  const validate = useCallback(
    (values) => (values.email.toLowerCase() !== profile.email.toLowerCase()
      ? EMAIL_INVALID_ERROR
      : NO_ERROR),
    [profile],
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
            {t('account__new:delete.dialog.title')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {t('account__new:delete.dialog.description', { email: profile.email })}
            </DialogContentText>
            <Field
              component={FieldText}
              name="email"
              variant="outlined"
              autoFocus
              id="email-address"
              fullWidth
              label={t('fields__new:email.label')}
              placeholder={profile.email || t('fields__new:email.placeholder')}
            />
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common__new:delete'),
              }}
              secondary={{
                text: t('common__new:cancel'),
                onClick: onClose,
              }}
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
  profile: PropTypes.shape({ email: PropTypes.string.isRequired }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common__new', 'fields__new'])(DeleteAccountDialog);
