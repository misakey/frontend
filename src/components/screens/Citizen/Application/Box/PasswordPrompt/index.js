
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

import Button from 'components/dumb/Button';
import ButtonSubmit from 'components/dumb/Button/Submit';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';

import { openVaultValidationSchema } from 'constants/validationSchemas/auth';


const PasswordPromptContext = React.createContext(null);
const defaultValues = { password: '' };

export const usePasswordPrompt = () => React.useContext(PasswordPromptContext);

function PasswordPrompt({ onClose, onSubmit, firstAttempt, t, open }) {
  const handleSubmit = useCallback((values, { resetForm, setSubmitting }) => {
    onSubmit(values);
    resetForm(defaultValues);
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
        {({ isValid, isSubmitting }) => (
          <Form>
            <DialogTitle id="alert-dialog-title">
              {t('screens:application.box.passwordPrompt.title')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t('screens:application.box.passwordPrompt.description')}
              </DialogContentText>
              <Field
                name="password"
                label={t('fields:passwordVault.label')}
                placeholder={t('fields:passwordVault.placeholder')}
                component={FieldTextPasswordRevealable}
                type="password"
                inputProps={{ 'data-matomo-ignore': true }}
              />
              {!firstAttempt && !isValid && (
              <FormHelperText error>{t('fields:passwordVault.error.invalid')}</FormHelperText>
              )}
            </DialogContent>
            <DialogActions>
              <>
                <Button onClick={onClose} text={t('common:cancel')} />
                <ButtonSubmit disabled={isSubmitting || !isValid} text={t('common:validate')} />
              </>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

const TPasswordPrompt = withTranslation(['common', 'screens'])(PasswordPrompt);

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
