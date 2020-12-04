
import { createContext, useContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import DialogPassword from 'components/smart/Dialog/Password';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

const PasswordPromptContext = createContext(null);

export const usePasswordPrompt = () => useContext(PasswordPromptContext);

const PasswordPrompt = withTranslation(['account'])(({ t, ...props }) => (
  <DialogPassword
    title={t('account:password.existing')}
    formikProps={{ enableReinitialize: true }}
    {...props}
  />
));

export const PasswordPromptProvider = ({ children }) => {
  const [
    confirmationState,
    setConfirmationState,
  ] = useState(null);

  const awaitingPromiseRef = useRef();

  const openConfirmation = (result) => {
    setConfirmationState({ open: true, ...result });
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

  const handleSubmit = ({ [PREHASHED_PASSWORD]: password }) => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve({ password });
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

      <PasswordPrompt
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
