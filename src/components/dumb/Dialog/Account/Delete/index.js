import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Formik, Form, Field } from 'formik';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';

import errorTypes from 'constants/errorTypes';

const { invalid } = errorTypes;

const DeleteAccountDialog = ({ onClose, onSuccess, open, profile, t }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <Formik
      onSubmit={onSuccess}
      values={{ email: '' }}
      validate={(values) => {
        if (values.email !== profile.email) {
          return { email: invalid };
        }
        return {};
      }}
    >
      {
        ({ isSubmitting, isValid }) => (
          <Form>
            <DialogTitle id="alert-dialog-title">
              {t('account.dialog.delete.title', 'Delete my account')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t('account.dialog.delete.description', { email: profile.email })}
              </DialogContentText>
              <Field
                component={FieldText}
                name="email"
                variant="outlined"
                autoFocus
                id="email-address"
                fullWidth
                label={t('fields:email.label', 'Email')}
                placeholder={profile.email || t('fields:email.placeHolder', 'love@misakey.com')}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>
                {t('account.dialog.delete.disagree', 'Disagree')}
              </Button>
              <ButtonSubmit
                isSubmitting={isSubmitting}
                disabled={isSubmitting || !isValid}
              >
                {t('account.dialog.delete.agree', 'Agree')}
              </ButtonSubmit>
            </DialogActions>
          </Form>
        )
      }
    </Formik>
  </Dialog>
);

DeleteAccountDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  profile: PropTypes.shape({ email: PropTypes.string.isRequired }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'fields'])(DeleteAccountDialog);
