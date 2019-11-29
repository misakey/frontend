import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { displayNameValidationSchema } from 'constants/validationSchemas/profile';
import { userProfileUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Subtitle from 'components/dumb/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import BoxControls from 'components/dumb/Box/Controls';
import FieldText from 'components/dumb/Form/Field/Text';
import ScreenAction from 'components/dumb/Screen/Action';

// HELPERS
const updateProfile = (id, form) => API
  .use(API.endpoints.user.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  profile, dispatchUpdateEntities, enqueueSnackbar, setInternalError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateProfile(profile.id, form)
    .then(() => {
      enqueueSnackbar(t('screens:account.name.success'), { variant: 'success' });
      dispatchUpdateEntities(profile.id, form, history);
      history.push(routes.account._);
    })
    .catch(({ httpStatus }) => {
      setInternalError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdateEntities, enqueueSnackbar, setInternalError, history, t],
);

// COMPONENTS
const AccountName = ({
  t,
  profile,
  dispatchUpdateEntities,
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
    dispatchUpdateEntities,
    enqueueSnackbar,
    setInternalError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  const { displayName } = profile;


  return (
    <ScreenAction
      title={t('screens:account.name.title')}
      state={state}
      hideAppBar
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('screens:account.name.subtitle')}
        </Subtitle>
        {displayName && (
          <Formik
            validationSchema={displayNameValidationSchema}
            onSubmit={onSubmit}
            initialValues={{ displayName }}
          >
            {({ isSubmitting, isValid }) => (
              <Form>
                <Field
                  type="text"
                  name="displayName"
                  component={FieldText}
                  label={t('fields:displayName.label')}
                  helperText={t('fields:displayName.helperText')}
                  inputProps={{ 'data-matomo-ignore': true }}
                />
                <BoxControls
                  mt={3}
                  primary={{
                    type: 'submit',
                    isLoading: isSubmitting,
                    isValid,
                    'aria-label': t('common:submit'),
                    text: t('common:submit'),
                  }}
                />
              </Form>
            )}
          </Formik>
        )}
      </Container>
    </ScreenAction>
  );
};

AccountName.propTypes = {
  profile: PropTypes.shape({ displayName: PropTypes.string, id: PropTypes.string }),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

AccountName.defaultProps = {
  profile: null,
  error: null,
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
)(withTranslation(['common', 'screens', 'fields'])(AccountName));
