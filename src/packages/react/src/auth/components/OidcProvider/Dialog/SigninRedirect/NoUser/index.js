import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Form } from 'formik';

import { AUTOFILL_USERNAME } from '@misakey/ui/constants/autofill';
import { STEP } from '@misakey/core/auth/constants';
import { identifierValidationSchema } from '@misakey/react/auth/constants/validationSchemas';

import Box from '@material-ui/core/Box';
import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Field from '@misakey/ui/Form/Field';
import Formik from '@misakey/ui/Formik';
import BoxControls from '@misakey/ui/Box/Controls';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
export const SHOULD_CREATE_ACCOUNT = 'shouldCreateAccount';

const INITIAL_VALUES = {
  [STEP.identifier]: '',
  [SHOULD_CREATE_ACCOUNT]: true,
};


const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
  },
}));


// COMPONENTS
const DialogSigninRedirectNoUser = ({ onSignInRedirect, title, subtitle }) => {
  const { t } = useTranslation('common');
  const classes = useStyles();

  const onSubmit = useCallback(
    ({ [STEP.identifier]: identifier, [SHOULD_CREATE_ACCOUNT]: shouldCreateAccount }) => {
      const extraStateParams = { shouldCreateAccount };
      // prompt: 'login' to ensure to erase eventual previous session
      onSignInRedirect({ prompt: 'login', extraStateParams, loginHints: { identifier } });
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
    <Box>
      <TitleBold align="center" gutterBottom={false}>{title}</TitleBold>
      <Subtitle align="center">{subtitle}</Subtitle>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={identifierValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ submitForm, setFieldValue, isSubmitting }) => (
          <Form>
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
            <Field
              name={SHOULD_CREATE_ACCOUNT}
              type="hidden"
            />
            <Box display="flex" width="100%" justifyContent="center">
              <BoxControls
                formik
                primary={{
                  text: t('components:signinRedirect.noUser.signUp'),
                  classes: { wrapper: classes.button },
                }}
                secondary={{
                  text: t('components:signinRedirect.noUser.signIn'),
                  onClick: onGetSignin({ submitForm, setFieldValue }),
                  classes: { wrapper: classes.button },
                  isLoading: isSubmitting,
                  standing: BUTTON_STANDINGS.TEXT,
                }}
                flexDirection="column"
                width={300}
              />
            </Box>
          </Form>
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
