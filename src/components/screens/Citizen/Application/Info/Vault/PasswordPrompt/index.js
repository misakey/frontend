
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Formik, Form, Field } from 'formik';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';

import BoxControls from 'components/dumb/Box/Controls';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

import { openVaultValidationSchema } from 'constants/validationSchemas/auth';


const PasswordPromptContext = React.createContext(null);
const defaultValues = { password: '' };

export const usePasswordPrompt = () => React.useContext(PasswordPromptContext);

function PasswordPrompt({ onClose, onSubmit, firstAttempt, t, open }) {
  const handleSubmit = useCallback((values, { resetForm, setSubmitting }) => {
    onSubmit(values);
    resetForm({ values: defaultValues });
    setSubmitting(false);
  }, [onSubmit]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <Formik
        onSubmit={handleSubmit}
        initialValues={defaultValues}
        validationSchema={openVaultValidationSchema.password}
      >
        {({ isValid }) => (
          <Form>
            <DialogTitle id="alert-dialog-title">
              {t('citizen:application.info.vault.passwordPrompt.title')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t('citizen:application.info.vault.passwordPrompt.description')}
              </DialogContentText>
              <Field
                name="password"
                label={t('fields:password.label')}
                placeholder={t('fields:password.placeholder')}
                component={FieldTextPasswordRevealable}
                type="password"
                inputProps={{ 'data-matomo-ignore': true }}
                autoFocus
              />
              {(!firstAttempt || !isValid) && (
              <FormHelperText error>{t('fields:password.error.invalid')}</FormHelperText>
              )}
            </DialogContent>
            <DialogActions>
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:validate'),
                }}
                secondary={{
                  text: t('common:cancel'),
                  onClick: onClose,
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

const TPasswordPrompt = withTranslation(['common', 'citizen', 'fields'])(PasswordPrompt);

PasswordPrompt.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  firstAttempt: PropTypes.bool,
  open: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

PasswordPrompt.defaultProps = {
  firstAttempt: true,
  open: false,
};


export const PasswordPromptProvider = ({ children }) => {
  const [
    confirmationState,
    setConfirmationState,
  ] = React.useState(null);

  const awaitingPromiseRef = React.useRef();

  const openConfirmation = ({ firstAttempt }) => {
    setConfirmationState({ open: true, firstAttempt });
    return new Promise((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject };
    });
  };

  const handleClose = () => {
    if (confirmationState.catchOnCancel && awaitingPromiseRef.current) {
      awaitingPromiseRef.current.reject();
    }

    setConfirmationState(null);
  };

  const handleSubmit = (value) => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(value);
    }

    setConfirmationState(null);
  };

  return (
    <>
      <PasswordPromptContext.Provider
        value={openConfirmation}
      >
        {children}
      </PasswordPromptContext.Provider>

      <TPasswordPrompt
        open={Boolean(confirmationState)}
        onSubmit={handleSubmit}
        onClose={handleClose}
        {...confirmationState}
      />
    </>
  );
};

PasswordPromptProvider.propTypes = {
  children: PropTypes.node,
};

PasswordPromptProvider.defaultProps = {
  children: null,
};
