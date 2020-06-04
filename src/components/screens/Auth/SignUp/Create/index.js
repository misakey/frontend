import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { Switch } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';


import routes from 'routes';
import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { stepSignUpValidationSchemas } from 'constants/validationSchemas/auth';

import { getCode, getDetails } from '@misakey/helpers/apiError';
import { createNewOwnerSecrets } from '@misakey/crypto/store/actions/concrete';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import fetchSignUp from '@misakey/auth/builder/signUp';

import { screenAuthSetCredentials, screenAuthSetPublics } from 'store/actions/screens/auth';

import Preamble from 'components/screens/Auth/SignUp/Create/Preamble';
import Identifier from 'components/screens/Auth/SignUp/Create/Identifier';
import Pseudo from 'components/screens/Auth/SignUp/Create/Pseudo';
import Notifications from 'components/screens/Auth/SignUp/Create/Notifications';
import Password from 'components/screens/Auth/SignUp/Create/Password';
import RouteFormik from 'components/smart/Route/Formik';

// CONSTANTS
const { notFound, conflict } = errorTypes;

const INITIAL_VALUES = {
  tos: false,
  misakeyKnow: false,
  misakeyCrypto: false,
  email: '',
  handle: '',
  notifications: '',
  password: '',
  passwordConfirm: '',
};

const SIGNUP_START = routes.auth.signUp.preamble;

const PATH_VALIDATION_SCHEMA = {
  [routes.auth.signUp.preamble]: stepSignUpValidationSchemas[0],
  [routes.auth.signUp.identifier]: stepSignUpValidationSchemas[1],
  [routes.auth.signUp.handle]: stepSignUpValidationSchemas[2],
  [routes.auth.signUp.notifications]: stepSignUpValidationSchemas[3],
  [routes.auth.signUp.password]: stepSignUpValidationSchemas[4],
};

const USER_HEAD_ENDPOINT = {
  method: 'HEAD',
  path: '/users',
};

// HELPERS
const fetchUserHead = (payload) => API
  .use(USER_HEAD_ENDPOINT)
  .build(undefined, undefined, payload)
  .send();

// COMPONENTS
const AuthSignUpCreate = ({
  dispatchSetCredentials,
  dispatchSetDisplayName,
  dispatchCreateNewOwnerSecrets,
  identifier,
  history,
  location: { pathname, search },
  t,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const validationSchema = useMemo(
    () => PATH_VALIDATION_SCHEMA[pathname],
    [pathname],
  );

  const initialValues = useMemo(
    () => ({ ...INITIAL_VALUES, email: identifier }),
    [identifier],
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
            pathname: routes.auth.signUp.notifications,
            search,
          });
        } else {
          throw e;
        }
      }),
    [dispatchSetDisplayName, history, search],
  );

  const onNotificationsSubmit = useCallback(
    () => Promise.resolve(
      history.push({
        pathname: routes.auth.signUp.password,
        search,
      }),
    ),
    [history, search],
  );

  const onPasswordSubmit = useCallback(
    async (values) => {
      await fetchSignUp({ dispatchCreateNewOwnerSecrets, ...values });

      const { email, password } = values;
      dispatchSetCredentials(email, password);

      history.push({
        pathname: routes.auth.signUp.confirm,
        search,
      });
    },
    [dispatchCreateNewOwnerSecrets, history, search, dispatchSetCredentials],
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
      } else if (pathname === routes.auth.signUp.notifications) {
        promise = onNotificationsSubmit();
      } else {
        promise = onPasswordSubmit(values);
      }
      promise
        .catch((e) => {
          const errorCode = getCode(e);
          const { email } = getDetails(e);
          // NB: error can happen if we passed the pseudo submit step
          // and someone activated that email in the meantime
          if (errorCode === conflict && email === conflict) {
            history.push({
              pathname: routes.auth.signUp.identifier,
              search,
            });
            // @FIXME for now the implementation clears touched status when mounting a subscreen
            // thus it hides the errors in the subscreen which disappear as they're only from API
            enqueueSnackbar(t('fields:email.error.conflict'), { variant: 'error' });
          } else {
            handleGenericHttpErrors(e);
          }
        })
        .finally(() => { setSubmitting(false); });
    },
    [pathname,
      onPreambleSubmit, onIdentifierSubmit, onPseudoSubmit, onNotificationsSubmit,
      onPasswordSubmit,
      history, search, enqueueSnackbar, t, handleGenericHttpErrors,
    ],
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formProps) => (
        <Form>
          <Switch>
            <RouteFormik
              start={SIGNUP_START}
              path={routes.auth.signUp.preamble}
              exact
              render={(routerProps) => (
                <Preamble {...formProps} {...routerProps} />
              )}
            />
            <RouteFormik
              start={SIGNUP_START}
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
            <RouteFormik
              start={SIGNUP_START}
              path={routes.auth.signUp.handle}
              exact
              render={(routerProps) => (
                <Pseudo {...formProps} {...routerProps} />
              )}
            />
            <RouteFormik
              start={SIGNUP_START}
              path={routes.auth.signUp.notifications}
              exact
              render={(routerProps) => (
                <Notifications {...formProps} {...routerProps} />
              )}
            />
            <RouteFormik
              start={SIGNUP_START}
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
  t: PropTypes.func.isRequired,
  // CONNECT
  identifier: PropTypes.string,
  dispatchSetCredentials: PropTypes.func.isRequired,
  dispatchSetDisplayName: PropTypes.func.isRequired,
  dispatchCreateNewOwnerSecrets: PropTypes.func.isRequired,
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
  dispatchCreateNewOwnerSecrets: (password) => dispatch(createNewOwnerSecrets(password)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('fields')(AuthSignUpCreate));
