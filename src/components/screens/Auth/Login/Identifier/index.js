import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

import { STEP, INITIAL_VALUES } from 'constants/auth';
import routes from 'routes';
import { identifierValidationSchema } from 'constants/validationSchemas/auth';
import { screenAuthSetIdentifier } from 'store/actions/screens/auth';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';

import { requireAuthable } from '@misakey/auth/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useHistory, useLocation } from 'react-router-dom';

import Title from 'components/dumb/Typography/Title';
import LoginFormFields from 'components/screens/Auth/Login/Identifier/Form/Fields';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarApplicationSso from 'components/dumb/Avatar/Application/Sso';
import Box from '@material-ui/core/Box';

// CONSTANTS
const CURRENT_STEP = STEP.identifier;

// COMPONENTS
const AuthLoginIdentifier = ({
  loginChallenge,
  client,
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
    }),
    [],
  );

  const onSubmit = useCallback(
    ({ identifier }) => requireAuthable(loginChallenge, identifier)
      .then((response) => Promise.all([
        dispatchSsoUpdate(response),
        dispatchSetIdentifier(identifier),
      ]))
      .then(() => {
        push({
          pathname: routes.auth.signIn.secret,
          search,
        });
      })
      .catch(handleHttpErrors),
    [loginChallenge, handleHttpErrors, dispatchSsoUpdate, dispatchSetIdentifier, push, search],
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
              <AvatarApplicationSso client={client} />
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
