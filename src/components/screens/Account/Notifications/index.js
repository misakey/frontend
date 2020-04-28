import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';
import routes from 'routes';
import { notificationsValidationSchema } from 'constants/validationSchemas/profile';
import { userProfileUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import propOr from '@misakey/helpers/propOr';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import snakeCase from '@misakey/helpers/snakeCase';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import Subtitle from 'components/dumb/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import FormFieldList from 'components/dumb/Form/Field/List';
import ListNotificationConfig from 'components/dumb/List/NotificationConfig';

// CONSTANTS
const FIELD_NAME = 'notifications';

const NAVIGATION_PROPS = {
  homePath: routes.account._,
};

// HELPERS
const notificationsProp = propOr('', FIELD_NAME);
const getFieldError = path(['details', snakeCase(FIELD_NAME)]);

const updateProfile = (id, form) => API
  .use(API.endpoints.user.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  profile, dispatchUpdateEntities, enqueueSnackbar, handleHttpErrors, history, t,
) => useMemo(
  () => (form, { setSubmitting, setFieldError }) => updateProfile(profile.id, form)
    .then(() => {
      enqueueSnackbar(t('account:notifications.success'), { variant: 'success' });
      dispatchUpdateEntities(profile.id, form, history);
      history.push(routes.account._);
    })
    .catch((e) => {
      const fieldError = getFieldError(e);
      if (fieldError) {
        setFieldError(FIELD_NAME, fieldError);
      } else {
        handleHttpErrors(e);
      }
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdateEntities, enqueueSnackbar, handleHttpErrors, history, t],
);

// COMPONENTS
const AccountNotifications = ({
  t,
  profile,
  dispatchUpdateEntities,
  history,
  isFetching,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const state = useMemo(
    () => ({ isLoading: isFetching }),
    [isFetching],
  );

  const notifications = useMemo(
    () => notificationsProp(profile),
    [profile],
  );

  const initialValues = useMemo(
    () => ({ notifications }),
    [notifications],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const onSubmit = useOnSubmit(
    profile,
    dispatchUpdateEntities,
    enqueueSnackbar,
    handleHttpErrors,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  return (
    <ScreenAction
      title={t('account:notifications.title')}
      state={state}
      navigationProps={NAVIGATION_PROPS}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:notifications.subtitle')}
        </Subtitle>
        {notifications && (
          <Formik
            validationSchema={notificationsValidationSchema}
            onSubmit={onSubmit}
            initialValues={initialValues}
          >
            <Form>
              <Field
                name={FIELD_NAME}
              >
                {(fieldProps) => (
                  <FormFieldList
                    component={ListNotificationConfig}
                    {...fieldProps}
                  />
                )}
              </Field>
            </Form>
          </Formik>
        )}
      </Container>
    </ScreenAction>
  );
};

AccountNotifications.propTypes = {
  profile: PropTypes.shape({ notifications: PropTypes.string, id: PropTypes.string }),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

AccountNotifications.defaultProps = {
  profile: null,
  isFetching: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateEntities: (id, changes, history) => {
    dispatch(userProfileUpdate(id, changes));
    history.push(routes.account._);
  },
});

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation(['common', 'account', 'fields'])(AccountNotifications));
