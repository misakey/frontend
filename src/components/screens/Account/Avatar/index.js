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

import API from '@misakey/api';

import ScreenError from 'components/dumb/Screen/Error';

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

// HOOKS
const useOnSubmit = (
  profile, dispatchUpdate, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateProfile(profile.id, pickForm(form))
    .then(() => {
      enqueueSnackbar(t('profile:avatar.success'), { variant: 'success' });
      const changes = { avatarUri: form.preview };
      dispatchUpdate(profile.id, changes, history);
      history.push(routes.account._);
    })
    .catch(({ httpStatus }) => {
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdate, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const AccountName = ({
  t,
  profile,
  dispatchUpdate,
  history,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = useOnSubmit(
    profile,
    dispatchUpdate,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  const { displayName, avatarUri } = profile;


  if (error) {
    return <ScreenError httpStatus={error} />;
  }
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

AccountName.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string,
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),

  // router props
  history: PropTypes.object.isRequired,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdate: PropTypes.func.isRequired,
};

AccountName.defaultProps = {
  profile: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (id, changes, history) => {
    dispatch(userProfileUpdate(id, changes)).then(() => {
      history.push(routes.account._);
    });
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['profile', 'button'])(AccountName));
