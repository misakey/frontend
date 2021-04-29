import React, { useCallback } from 'react';

import PropTypes from 'prop-types';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { AUTOFILL_USERNAME } from '@misakey/ui/constants/autofill';
import { STEP } from '@misakey/core/auth/constants';
import { identifierValidationSchema } from '@misakey/react/auth/constants/validationSchemas';

import { useTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Field from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import { Form } from 'formik';

// CONSTANTS
export const SHOULD_CREATE_ACCOUNT = 'shouldCreateAccount';

const INITIAL_VALUES = {
  [STEP.identifier]: '',
  [SHOULD_CREATE_ACCOUNT]: true,
};


// COMPONENTS
const DialogSigninRedirectNoUser = ({ onSignInRedirect, title, subtitle }) => {
  const { t } = useTranslation('common');

  const onSubmit = useCallback(
    ({ [STEP.identifier]: identifier, [SHOULD_CREATE_ACCOUNT]: shouldCreateAccount }) => {
      const misakeyCallbackHints = { shouldCreateAccount };
      onSignInRedirect({ misakeyCallbackHints, loginHint: identifier });
    },
    [onSignInRedirect],
  );

  const onGetSignin = useCallback(
    ({ setFieldValue, submitForm }) => () => {
      setFieldValue(SHOULD_CREATE_ACCOUNT, false);
      submitForm();
    },
    [],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
    >
      <TitleBold align="center" gutterBottom={false}>{title}</TitleBold>
      <Subtitle align="center">{subtitle}</Subtitle>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={identifierValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ submitForm, setFieldValue, isSubmitting }) => (
          <Box
            component={Form}
            display="flex"
            flexDirection="column"
            alignItems="center"
            flexGrow={1}
          >
            <Field
              margin="none"
              suffix=":email"
              name={STEP.identifier}
              component={FieldText}
              variant="filled"
              type="email"
              inputProps={AUTOFILL_USERNAME}
              autoFocus
            />
            <BoxControlsCard
              mt={3}
              minWidth={300}
              primary={{
                text: t('components:signinRedirect.noUser.signUp'),
              }}
              secondary={{
                text: t('components:signinRedirect.noUser.signIn'),
                onClick: onGetSignin({ submitForm, setFieldValue }),
                isLoading: isSubmitting,
                standing: BUTTON_STANDINGS.TEXT,
              }}
              formik
            />
          </Box>
        )}
      </Formik>
    </Box>
  );
};

DialogSigninRedirectNoUser.propTypes = {
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  onSignInRedirect: PropTypes.func.isRequired,
};

export default DialogSigninRedirectNoUser;
