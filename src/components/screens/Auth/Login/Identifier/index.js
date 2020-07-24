import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { STEP, INITIAL_VALUES, ERROR_KEYS } from 'constants/auth';
import routes from 'routes';
import { identifierValidationSchema } from 'constants/validationSchemas/auth';
import { screenAuthSetIdentifier } from 'store/actions/screens/auth';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';

import compose from '@misakey/helpers/compose';
import head from '@misakey/helpers/head';
import isNil from '@misakey/helpers/isNil';
import props from '@misakey/helpers/props';
import { requireAuthable } from '@misakey/auth/builder/identities';
import { getDetails } from '@misakey/helpers/apiError';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useHistory, useLocation } from 'react-router-dom';

import Title from '@misakey/ui/Typography/Title';
import LoginFormFields from 'components/screens/Auth/Login/Identifier/Form/Fields';
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
  client,
  identifier,
  dispatchSsoUpdate,
  dispatchSetIdentifier,
  t,
}) => {
  const handleHttpErrors = useHandleHttpErrors();

  const { search } = useLocation();
  const { push } = useHistory();

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES[CURRENT_STEP],
      identifier,
    }),
    [identifier],
  );

  const onSubmit = useCallback(
    (
      { identifier: nextIdentifier },
      { setFieldError },
    ) => requireAuthable(loginChallenge, nextIdentifier)
      .then((response) => Promise.all([
        dispatchSsoUpdate(response),
        dispatchSetIdentifier(nextIdentifier),
      ]))
      .then(() => {
        push({
          pathname: routes.auth.signIn.secret,
          search,
        });
      })
      .catch((e) => {
        const details = getDetails(e);
        const identifierError = getIdentifierError(details);

        if (!isNil(identifierError)) {
          setFieldError(CURRENT_STEP, identifierError);
        } else {
          handleHttpErrors(e);
        }
      }),
    [loginChallenge, dispatchSsoUpdate, dispatchSetIdentifier, push, search, handleHttpErrors],
  );

  const primary = useMemo(() => ({
    text: t('common:next'),
  }),
  [t]);

  return (
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
              &nbsp;?
            </Box>
          </Box>
        </Title>
        <LoginFormFields />
        <BoxControls formik primary={primary} />
      </Form>
    </Formik>
  );
};

AuthLoginIdentifier.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  client: SSO_PROP_TYPES.client.isRequired,
  dispatchSetIdentifier: PropTypes.func.isRequired,
  dispatchSsoUpdate: PropTypes.func.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  client: state.sso.client,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSsoUpdate: (sso) => dispatch(ssoUpdate(sso)),
  dispatchSetIdentifier: (identifier) => dispatch(screenAuthSetIdentifier(identifier)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['auth', 'common'])(AuthLoginIdentifier));
