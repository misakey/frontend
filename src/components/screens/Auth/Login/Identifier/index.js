import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { APPBAR_SPACING } from '@misakey/ui/constants/sizes';
import { STEP, INITIAL_VALUES } from '@misakey/auth/constants';
import { ERROR_KEYS } from 'constants/auth';
import { identifierValidationSchema } from '@misakey/auth/constants/validationSchemas/auth';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import props from '@misakey/helpers/props';
import { getDetails } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOnIdentifierSubmit from 'hooks/useOnIdentifierSubmit';

import Title from '@misakey/ui/Typography/Title';
import Container from '@material-ui/core/Container';
import LoginFormFields from '@misakey/ui/Form/Fields/Login/Identifier';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import Box from '@material-ui/core/Box';

// CONSTANTS
const CURRENT_STEP = STEP.identifier;

// HELPERS
const getIdentifierError = compose(
  head,
  (errors) => errors.filter((error) => !isNil(error)),
  props(ERROR_KEYS[CURRENT_STEP]),
);


// COMPONENTS
const AuthLoginIdentifier = ({
  loginChallenge,
  loginHint,
  client,
  identifier,
  t,
}) => {
  const handleHttpErrors = useHandleHttpErrors();

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES[CURRENT_STEP],
      identifier,
    }),
    [identifier],
  );

  const objLoginHint = useMemo(
    () => (isEmpty(loginHint) ? null : objectToCamelCase(JSON.parse(loginHint))),
    [loginHint],
  );

  const { resourceName } = useSafeDestr(objLoginHint);

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

  const primary = useMemo(() => ({
    text: t('common:next'),
  }),
  [t]);

  return (
    <Container maxWidth="md">
      <Box mt={2 * APPBAR_SPACING}>
        <Formik
          initialValues={initialValues}
          validationSchema={identifierValidationSchema}
          onSubmit={onSubmit}
          enableReinitialize
        >
          <Form>
            <Title>
              <Box display="flex" overflow="hidden" flexWrap="wrap" component={Trans} i18nKey="auth:login.identifier.title">
                <Box display="flex" flexWrap="nowrap">Quel est votre identifiant pour</Box>
                <Box ml={1} display="flex" flexWrap="nowrap">
                  <AvatarClientSso client={client} />
                  {!isEmpty(resourceName) && (
                    <>
                      &nbsp;-&nbsp;
                      {resourceName}
                    </>
                  )}
              &nbsp;?
                </Box>
              </Box>
            </Title>
            <LoginFormFields />
            <BoxControls formik primary={primary} />
          </Form>
        </Formik>
      </Box>
    </Container>
  );
};

AuthLoginIdentifier.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  client: SSO_PROP_TYPES.client.isRequired,
  loginHint: SSO_PROP_TYPES.loginHint.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  client: state.sso.client,
});

export default connect(mapStateToProps, {})(withTranslation(['auth', 'common'])(AuthLoginIdentifier));
