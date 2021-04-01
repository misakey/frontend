import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { STEP, INITIAL_VALUES, ERROR_KEYS } from '@misakey/core/auth/constants';
import { identifierValidationSchema } from '@misakey/react/auth/constants/validationSchemas';

import compose from '@misakey/core/helpers/compose';
import head from '@misakey/core/helpers/head';
import isNil from '@misakey/core/helpers/isNil';
import props from '@misakey/core/helpers/props';
import { getDetails } from '@misakey/core/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useOnIdentifierSubmit from '@misakey/react/auth/hooks/useOnIdentifierSubmit';

import CardUser from '@misakey/react/auth/components/Card/User';
import LoginFormField from '@misakey/ui/Form/Field/Login/Identifier';
import SecretHiddenFormField from '@misakey/ui/Form/Field/Login/Secret/Hidden';
import BoxControls from '@misakey/ui/Box/Controls';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';

// CONSTANTS
const CURRENT_STEP = STEP.identifier;

// HELPERS
const getIdentifierError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[CURRENT_STEP]),
);

// COMPONENTS
const AuthLoginIdentifierForm = ({ loginChallenge, identifier }) => {
  const handleHttpErrors = useHandleHttpErrors();
  const { t } = useTranslation(['common']);

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES[CURRENT_STEP],
      identifier,
    }),
    [identifier],
  );

  const onIdentifierSubmit = useOnIdentifierSubmit(loginChallenge);

  const onSubmit = useCallback(
    (
      { identifier: nextIdentifier },
      { setFieldError },
    ) => onIdentifierSubmit(nextIdentifier)
      .catch((e) => {
        const details = getDetails(e);
        const identifierError = getIdentifierError(details);

        if (!isNil(identifierError)) {
          setFieldError(CURRENT_STEP, identifierError);
        } else {
          handleHttpErrors(e);
        }
      }),
    [onIdentifierSubmit, handleHttpErrors],
  );

  const primary = useMemo(() => ({ text: t('common:next') }), [t]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={identifierValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      <Form>

        <CardUser
          hideSkeleton
          my={3}
        >
          <LoginFormField
            FormHelperTextProps={{ component: FormHelperTextInCard }}
            margin="none"
          />
          <SecretHiddenFormField />
        </CardUser>
        <BoxControls formik primary={primary} />
      </Form>
    </Formik>
  );
};

AuthLoginIdentifierForm.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
};

export default AuthLoginIdentifierForm;
