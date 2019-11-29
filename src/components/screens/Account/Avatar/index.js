import React, { useMemo, useState, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { avatarValidationSchema } from 'constants/validationSchemas/profile';
import { userProfileUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';
import pick from '@misakey/helpers/pick';
import toFormData from '@misakey/helpers/toFormData';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import API from '@misakey/api';


import 'components/screens/Account/Avatar/index.scss';

// LAZY
const AccountAvatarDisplay = lazy(() => import('./Display'));
const AccountAvatarUpload = lazy(() => import('./Upload'));


// CONSTANTS
const FIELD_NAME = 'avatar';
const PREVIEW_NAME = 'preview';
const INITIAL_VALUES = {
  [FIELD_NAME]: null,
};

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
  profile, dispatchUpdate, enqueueSnackbar, setInternalError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateProfile(profile.id, pickForm(form))
    .then(() => fetchProfile(profile.id))
    .then((response) => {
      const { avatarUri } = objectToCamelCase(response);
      const changes = { avatarUri };
      enqueueSnackbar(t('screens:account.avatar.success'), { variant: 'success' });
      dispatchUpdate(profile.id, changes, history);
      history.push(routes.account._);
    })
    .catch(({ httpStatus }) => {
      setInternalError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdate, enqueueSnackbar, setInternalError, history, t],
);

// COMPONENTS
const AccountAvatar = ({
  t,
  profile,
  dispatchUpdate,
  history,
  error,
  isFetching,
}) => {
  const [internalError, setInternalError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ error: error || internalError, isLoading: isFetching }),
    [error, internalError, isFetching],
  );

  const onSubmit = useOnSubmit(
    profile,
    dispatchUpdate,
    enqueueSnackbar,
    setInternalError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  const { displayName, avatarUri } = profile;

  return (
    <div className="Avatar">
      <Formik
        validationSchema={avatarValidationSchema}
        onSubmit={onSubmit}
        initialValues={{ avatar: avatarUri }}
      >
        {(formikProps) => (
          <Form className="form">
            <Switch>
              <Route
                exact
                path={routes.account.profile.avatar._}
                render={(routerProps) => (
                  <AccountAvatarDisplay
                    avatarUri={avatarUri}
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
  profile: PropTypes.shape({
    id: PropTypes.string,
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),
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
  profile: null,
  error: null,
  isFetching: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (id, changes, history) => {
    dispatch(userProfileUpdate(id, changes)).then(() => {
      history.push(routes.account._);
    });
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['screens'])(AccountAvatar));
