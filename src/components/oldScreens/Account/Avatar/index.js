import React, { useMemo, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import IdentitySchema from 'store/schemas/Identity';
import routes from 'routes';
import API from '@misakey/api';
import { avatarValidationSchema } from 'constants/validationSchemas/identity';
import { userIdentityUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';
import pick from '@misakey/helpers/pick';
import toFormData from '@misakey/helpers/toFormData';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';


import 'components/oldScreens/Account/Avatar/index.scss';

// LAZY
const AccountAvatarDisplay = lazy(() => import('./Display'));
const AccountAvatarUpload = lazy(() => import('./Upload'));


// CONSTANTS
const FIELD_NAME = 'avatar';
const PREVIEW_NAME = 'preview';
const INITIAL_VALUES = {
  [FIELD_NAME]: null,
};
const EMPTY_OBJECT = {};

// HELPERS
const pickForm = pick(Object.keys(INITIAL_VALUES));

const updateProfile = (id, form) => API
  .use(API.endpoints.user.avatar.update)
  .build({ id }, toFormData(form))
  .send({ contentType: null });

const fetchProfile = (id) => API
  .use(API.endpoints.user.read)
  .build({ id })
  .send();

// HOOKS
const useOnSubmit = (
  identity, dispatchUpdate, enqueueSnackbar, handleHttpErrors, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateProfile(identity.id, pickForm(form))
    .then(() => fetchProfile(identity.id))
    .then((response) => {
      const { avatarUrl } = objectToCamelCase(response);
      const changes = { avatarUrl };
      enqueueSnackbar(t('account:avatar.success'), { variant: 'success' });
      dispatchUpdate(identity.id, changes, history);
    })
    .catch(handleHttpErrors)
    .finally(() => { setSubmitting(false); }),
  [identity, dispatchUpdate, enqueueSnackbar, handleHttpErrors, history, t],
);

// COMPONENTS
const AccountAvatar = ({
  t,
  identity,
  dispatchUpdate,
  history,
  isFetching,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const { displayName, avatarUrl } = useMemo(
    () => identity || EMPTY_OBJECT,
    [identity],
  );

  const initialValues = useMemo(
    () => ({ avatar: avatarUrl }),
    [avatarUrl],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const onSubmit = useOnSubmit(
    identity,
    dispatchUpdate,
    enqueueSnackbar,
    handleHttpErrors,
    history,
    t,
  );

  if (isNil(identity)) { return null; }

  return (
    <div className="Avatar">
      <Formik
        validationSchema={avatarValidationSchema}
        onSubmit={onSubmit}
        initialValues={initialValues}
      >
        {(formikProps) => (
          <Form className="form">
            <Switch>
              <Route
                exact
                path={routes.account.profile.avatar._}
                render={(routerProps) => (
                  <AccountAvatarDisplay
                    avatarUrl={avatarUrl}
                    displayName={displayName}
                    name={FIELD_NAME}
                    previewName={PREVIEW_NAME}
                    state={state}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
              <Route
                exact
                path={routes.account.profile.avatar.upload}
                render={(routerProps) => (
                  <AccountAvatarUpload
                    name={FIELD_NAME}
                    previewName={PREVIEW_NAME}
                    state={state}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
            </Switch>

          </Form>
        )}
      </Formik>
    </div>
  );
};

AccountAvatar.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdate: PropTypes.func.isRequired,
};

AccountAvatar.defaultProps = {
  identity: null,
  error: null,
  isFetching: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (id, changes, history) => {
    dispatch(userIdentityUpdate(id, changes)).then(() => {
      history.push(routes.account._);
    });
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['account'])(AccountAvatar));
