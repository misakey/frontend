import React, { forwardRef, useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';

import { PREHASHED_PASSWORD, PASSWORD_RESET_KEY } from '@misakey/auth/constants/method';
import { resetPasswordValidationSchema } from 'constants/validationSchemas/auth';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import DialogPassword from 'components/smart/Dialog/Password';

// COMPONENTS
const DialogPasswordReset = forwardRef(({
  t,
  onClose,
  onSubmit,
  ...props
}, ref) => {
  const { setFieldValue, submitForm, setSubmitting } = useFormikContext();

  const formikProps = useMemo(
    () => ({ validationSchema: resetPasswordValidationSchema }),
    [],
  );

  const handleSubmit = useCallback(
    ({ [PREHASHED_PASSWORD]: password }) => {
      setFieldValue(PASSWORD_RESET_KEY, password);
      onSubmit();
      setTimeout(submitForm, 0);
    },
    [onSubmit, setFieldValue, submitForm],
  );

  const handleClose = useCallback(
    () => {
      setSubmitting(false);
      return onClose();
    },
    [onClose, setSubmitting],
  );

  return (
    <DialogPassword
      ref={ref}
      title={t('auth:resetPassword')}
      onClose={handleClose}
      onSubmit={handleSubmit}
      formikProps={formikProps}
      {...omitTranslationProps(props)}
    />
  );
});

DialogPasswordReset.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

DialogPasswordReset.defaultProps = {
  open: false,
};

export default withTranslation('auth')(DialogPasswordReset);

