import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import API from '@misakey/api';
import errorTypes from 'constants/errorTypes';

import { stepSignUpValidationSchemas } from 'constants/validationSchemas/auth';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { ownerCryptoContext as crypto } from '@misakey/crypto';

import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

import { screenAuthSetCredentials, screenAuthSetPublics } from 'store/actions/screens/auth';

import Preamble from 'components/screens/Auth/SignUp/Create/Preamble';
import Identifier from 'components/screens/Auth/SignUp/Create/Identifier';
import Pseudo from 'components/screens/Auth/SignUp/Create/Pseudo';
import Password from 'components/screens/Auth/SignUp/Create/Password';
import RouteSignUp from 'components/smart/Route/SignUp';

// CONSTANTS
const { notFound, conflict } = errorTypes;

const INITIAL_VALUES = {
  tos: false,
  email: '',
  handle: '',
  password: '',
  passwordConfirm: '',
};

const SIGNUP_START = routes.auth.signUp.preamble;

const PATH_VALIDATION_SCHEMA = {
  [routes.auth.signUp.preamble]: stepSignUpValidationSchemas[0],
  [routes.auth.signUp.identifier]: stepSignUpValidationSchemas[1],
  [routes.auth.signUp.handle]: stepSignUpValidationSchemas[2],
  [routes.auth.signUp.password]: stepSignUpValidationSchemas[3],
};

const USER_HEAD_ENDPOINT = {
  method: 'HEAD',
  path: '/users',
};

// HELPERS
const fetchSignUp = (payload) => API
  .use(API.endpoints.auth.signUp)
  .build(undefined, objectToSnakeCase(payload))
  .send();

const fetchUserHead = (payload) => API
  .use(USER_HEAD_ENDPOINT)
  .build(undefined, undefined, payload)
  .send();


async function createSecrets(values, actions, afterCrypto) {
  const { password } = values;
  const { backupData, pubkeyData } = await crypto.createNewOwnerSecrets(password);

  return afterCrypto({ ...values, pubkeyData, backupData }, actions);
}

// COMPONENTS
const AuthSignUpCreate = ({
  dispatchSetCredentials,
  dispatchSetDisplayName,
  identifier,
  history,
  location: { pathname, search },
}) => {
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const validationSchema = useMemo(
    () => PATH_VALIDATION_SCHEMA[pathname],
    [pathname],
  );

  const initialValues = useMemo(
    () => ({ ...INITIAL_VALUES, email: identifier }),
    [identifier],
  );

  const afterCrypto = useCallback(
    ({ email, password, handle, passwordConfirm, ...rest }) => {
      dispatchSetCredentials(email, password);

      const payload = { email, password, displayName: handle, handle, ...rest };

      return fetchSignUp(payload)
        .then(() => {
          history.push({
            pathname: routes.auth.signUp.confirm,
            search,
          });
        });
    },
    [dispatchSetCredentials, history, search],
  );

  const onPreambleSubmit = useCallback(
    () => Promise.resolve(
      history.push({
        pathname: routes.auth.signUp.identifier,
        search,
      }),
    ),
    [history, search],
  );

  const onIdentifierSubmit = useCallback(
    ({ email }, { setErrors }) => fetchUserHead({ email })
      .then(() => {
        setErrors({ email: conflict });
      })
      .catch((e) => {
        if (e.code === notFound) {
          dispatchSetCredentials(email);
          history.push({
            pathname: routes.auth.signUp.handle,
            search,
          });
        } else {
          throw e;
        }
      }),
    [dispatchSetCredentials, history, search],
  );

  const onPseudoSubmit = useCallback(
    ({ handle }, { setErrors }) => fetchUserHead({ handle })
      .then(() => {
        setErrors({ handle: conflict });
      })
      .catch((e) => {
        if (e.code === notFound) {
          dispatchSetDisplayName(handle);
          history.push({
            pathname: routes.auth.signUp.password,
            search,
          });
        } else {
          throw e;
        }
      }),
    [dispatchSetDisplayName, history, search],
  );

  const onSubmit = useCallback(
    (values, actions) => {
      const { setSubmitting } = actions;

      let promise = Promise.resolve();

      if (pathname === routes.auth.signUp.preamble) {
        promise = onPreambleSubmit();
      } else if (pathname === routes.auth.signUp.identifier) {
        promise = onIdentifierSubmit(values, actions);
      } else if (pathname === routes.auth.signUp.handle) {
        promise = onPseudoSubmit(values, actions);
      } else {
        promise = createSecrets(values, actions, afterCrypto);
      }
      promise
        .catch((e) => {
          handleGenericHttpErrors(e);
        })
        .finally(() => { setSubmitting(false); });
    },
    [
      afterCrypto,
      handleGenericHttpErrors,
      onIdentifierSubmit,
      onPreambleSubmit,
      onPseudoSubmit,
      pathname,
    ],
  );

  return (
    <Formik
      isInitialValid
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formProps) => (
        <Form>
          <Switch>
            <RouteSignUp
              start={SIGNUP_START}
              dirty={formProps.dirty}
              path={routes.auth.signUp.preamble}
              exact
              render={(routerProps) => (
                <Preamble {...formProps} {...routerProps} />
              )}
            />
            <RouteSignUp
              start={SIGNUP_START}
              dirty={formProps.dirty}
              path={routes.auth.signUp.identifier}
              exact
              render={(routerProps) => (
                <Identifier
                  {...formProps}
                  {...routerProps}
                  dispatchSetCredentials={dispatchSetCredentials}
                />
              )}
            />
            <RouteSignUp
              start={SIGNUP_START}
              dirty={formProps.dirty}
              path={routes.auth.signUp.handle}
              exact
              render={(routerProps) => (
                <Pseudo {...formProps} {...routerProps} />
              )}
            />
            <RouteSignUp
              start={SIGNUP_START}
              dirty={formProps.dirty}
              path={routes.auth.signUp.password}
              exact
              render={(routerProps) => (
                <Password {...formProps} {...routerProps} />
              )}
            />
          </Switch>
        </Form>
      )}
    </Formik>
  );
};

AuthSignUpCreate.propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  // CONNECT
  identifier: PropTypes.string,
  dispatchSetCredentials: PropTypes.func.isRequired,
  dispatchSetDisplayName: PropTypes.func.isRequired,
};

AuthSignUpCreate.defaultProps = {
  identifier: INITIAL_VALUES.email,
};


// CONNECT
const mapStateToProps = (state) => ({
  identifier: state.screens.auth.identifier,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchSetCredentials: (identifier, secret) => dispatch(
    screenAuthSetCredentials(identifier, secret),
  ),
  dispatchSetDisplayName: (displayName) => dispatch(screenAuthSetPublics({ displayName })),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthSignUpCreate);
