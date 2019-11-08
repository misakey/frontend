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

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from '@misakey/ui/Navigation';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import FieldText from '@misakey/ui/Form/Field/Text';
import ScreenError from 'components/dumb/Screen/Error';

import 'components/screens/Account/Name/index.scss';

// HELPERS
const updateProfile = (id, form) => API
  .use(API.endpoints.user.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  profile, dispatchUpdateEntities, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateProfile(profile.id, form)
    .then(() => {
      enqueueSnackbar(t('profile:name.success'), { variant: 'success' });
      dispatchUpdateEntities(profile.id, form, history);
      history.push(routes.account._);
    })
    .catch(({ httpStatus }) => {
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [profile, dispatchUpdateEntities, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const AccountName = ({
  t,
  profile,
  dispatchUpdateEntities,
  history,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = useOnSubmit(
    profile,
    dispatchUpdateEntities,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  if (isNil(profile)) { return null; }

  const { displayName } = profile;

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <div className="Name">
      <div className="header">
        <Navigation history={history} title={t('profile:name.title')} />
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('profile:name.subtitle')}
        </Typography>
      </div>
      {displayName && (
        <Formik
          validationSchema={displayNameValidationSchema}
          onSubmit={onSubmit}
          initialValues={{ displayName }}
        >
          {({ isSubmitting, isValid }) => (
            <Container maxWidth="sm" className="content">
              <Form className="form">
                <Field
                  className="field"
                  type="text"
                  name="displayName"
                  component={FieldText}
                  label={t('profile:form.field.displayName.label')}
                  helperText={t('profile:form.field.displayName.hint')}
                  inputProps={{ 'data-matomo-ignore': true }}
                />
                <ButtonSubmit isSubmitting={isSubmitting} isValid={isValid}>
                  {t('submit')}
                </ButtonSubmit>
              </Form>
            </Container>
          )}
        </Formik>
      )}
    </div>
  );
};

AccountName.propTypes = {
  profile: PropTypes.shape({ displayName: PropTypes.string, id: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

AccountName.defaultProps = {
  profile: null,
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
)(withTranslation(['common', 'profile'])(AccountName));
