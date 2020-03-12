import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { displayNameValidationSchema } from 'constants/validationSchemas/profile';
import { userProfileUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import propOr from '@misakey/helpers/propOr';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import snakeCase from '@misakey/helpers/snakeCase';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import Subtitle from 'components/dumb/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import BoxControls from 'components/dumb/Box/Controls';
import FieldText from 'components/dumb/Form/Field/Text';
import ScreenAction from 'components/dumb/Screen/Action';

// CONSTANTS
const FIELD_NAME = 'displayName';

// HELPERS
const displayNameProp = propOr('', FIELD_NAME);
const getFieldError = path(['details', snakeCase(FIELD_NAME)]);

const updateProfile = (id, form) => API
  .use(API.endpoints.user.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  profile, dispatchUpdateEntities, enqueueSnackbar, handleGenericHttpErrors, history, t,
) => useMemo(
  () => (form, { setSubmitting, setFieldError }) => updateProfile(profile.id, form)
    .then(() => {
      enqueueSnackbar(t('account:name.success'), { variant: 'success' });
      dispatchUpdateEntities(profile.id, form, history);
      history.push(routes.account._);
    })
    .catch((e) => {
      const fieldError = getFieldError(e);
      if (fieldError) {
        setFieldError(FIELD_NAME, fieldError);
      } else {
        handleGenericHttpErrors(e);
      }
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdateEntities, enqueueSnackbar, handleGenericHttpErrors, history, t],
);

// COMPONENTS
const AccountName = ({
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

  const displayName = useMemo(
    () => displayNameProp(profile),
    [profile],
  );

  const initialValues = useMemo(
    () => ({ displayName }),
    [displayName],
  );

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const onSubmit = useOnSubmit(
    profile,
    dispatchUpdateEntities,
    enqueueSnackbar,
    handleGenericHttpErrors,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  return (
    <ScreenAction
      title={t('account:name.title')}
      state={state}
      appBarProps={{ withSearchBar: false }}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:name.subtitle')}
        </Subtitle>
        {displayName && (
          <Formik
            validationSchema={displayNameValidationSchema}
            onSubmit={onSubmit}
            initialValues={initialValues}
          >
            <Form>
              <Field
                type="text"
                name={FIELD_NAME}
                component={FieldText}
                label={t('fields:displayName.label')}
                helperText={t('fields:displayName.helperText')}
                inputProps={{ 'data-matomo-ignore': true }}
              />
              <BoxControls
                mt={3}
                primary={{
                  type: 'submit',
                  'aria-label': t('common:submit'),
                  text: t('common:submit'),
                }}
                formik
              />
            </Form>
          </Formik>
        )}
      </Container>
    </ScreenAction>
  );
};

AccountName.propTypes = {
  profile: PropTypes.shape({ displayName: PropTypes.string, id: PropTypes.string }),
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
)(withTranslation(['common', 'account', 'fields'])(AccountName));
