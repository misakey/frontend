import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import IdentitySchema from 'store/schemas/Identity';
import API from '@misakey/api';
import routes from 'routes';
import { displayNameValidationSchema } from 'constants/validationSchemas/identity';
import { userIdentityUpdate } from 'store/actions/screens/account';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import propOr from '@misakey/helpers/propOr';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import snakeCase from '@misakey/helpers/snakeCase';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import Subtitle from '@misakey/ui/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldText from 'components/dumb/Form/Field/Text';
import ScreenAction from 'components/dumb/Screen/Action';

// CONSTANTS
const FIELD_NAME = 'displayName';

const NAVIGATION_PROPS = {
  homePath: routes.account._,
};

// HELPERS
const displayNameProp = propOr('', FIELD_NAME);
const getFieldError = path(['details', snakeCase(FIELD_NAME)]);

const updateProfile = (id, form) => API
  .use(API.endpoints.user.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  identity, dispatchUpdateEntities, enqueueSnackbar, handleHttpErrors, history, t,
) => useMemo(
  () => (form, { setSubmitting, setFieldError }) => updateProfile(identity.id, form)
    .then(() => {
      enqueueSnackbar(t('account:name.success'), { variant: 'success' });
      dispatchUpdateEntities(identity.id, form, history);
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
  [identity, dispatchUpdateEntities, enqueueSnackbar, handleHttpErrors, history, t],
);

// COMPONENTS
const AccountName = ({
  t,
  identity,
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
    () => displayNameProp(identity),
    [identity],
  );

  const initialValues = useMemo(
    () => ({ displayName }),
    [displayName],
  );

  const handleHttpErrors = useHandleHttpErrors();

  const onSubmit = useOnSubmit(
    identity,
    dispatchUpdateEntities,
    enqueueSnackbar,
    handleHttpErrors,
    history,
    t,
  );

  if (isNil(identity)) { return null; }

  return (
    <ScreenAction
      title={t('account:name.title')}
      state={state}
      navigationProps={NAVIGATION_PROPS}
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
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

AccountName.defaultProps = {
  identity: null,
  isFetching: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateEntities: (id, changes, history) => {
    dispatch(userIdentityUpdate(id, changes));
    history.push(routes.account._);
  },
});

export default connect(
  null,
  mapDispatchToProps,
)(withTranslation(['common', 'account', 'fields'])(AccountName));
