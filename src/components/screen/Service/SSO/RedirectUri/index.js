import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { redirectUriForm } from 'constants/validationSchemas/sso';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from 'components/dumb/Navigation';
import FieldText from '@misakey/ui/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ScreenError from 'components/screen/Error';


// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
  maxWidth: 'sm',
  component: Container,
};

const PARENT_ROUTE = routes.service.sso._;

// @FIXME js-common
const SSO_UPDATE_ENDPOINT = {
  method: 'PUT',
  path: '/sso-clients/:id',
  auth: true,
};

// HELPERS
const updateApplicationSSO = (id, form) => API
  .use(SSO_UPDATE_ENDPOINT)
  .build({ id }, objectToSnakeCase(form))
  .send();

const redirectUriToList = redirectUriString => [redirectUriString];
const listToRedirectUri = (redirectUriList) => {
  const redirectUri = redirectUriList[0];
  return isNil(redirectUri) ? '' : redirectUri;
};

const getRedirectUri = service => (isNil(service) ? '' : listToRedirectUri(service));

// HOOKS
const useOnSubmit = (
  service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (
    { redirectUris }, { setSubmitting },
  ) => {
    const form = { redirectUris: redirectUriToList(redirectUris) };
    return updateApplicationSSO(
      service.id,
      form,
    )
      .then(() => {
        enqueueSnackbar(t('service:sso.redirectUri.success'), { variant: 'success' });
        dispatchUpdateEntities(service.mainDomain, form, history);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus ? error.httpStatus : 500;
        setError(httpStatus);
      })
      .finally(() => { setSubmitting(false); });
  },
  [service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const SSORedirectUri = ({
  t,
  service,
  dispatchUpdateEntities,
  history,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = useOnSubmit(
    service,
    dispatchUpdateEntities,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  const redirectUris = useMemo(
    () => getRedirectUri(service),
    [service],
  );

  const pushPath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <>
      <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={pushPath} hideBackButton={false} title={t('service:sso.redirectUri.title')} />
      <Container maxWidth="sm" className="screen">
        <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
          {t('service:sso.redirectUri.subtitle')}
        </Typography>
        <Formik
          validationSchema={redirectUriForm}
          onSubmit={onSubmit}
          initialValues={{ redirectUris }}
        >
          {({ isSubmitting, isValid }) => (
            <div className="content">
              <Form className="form">
                <Field
                  className="field"
                  type="url"
                  name="redirectUris"
                  autoFocus
                  component={FieldText}
                  label={t('fields:redirectUris.label')}
                />
                <ButtonSubmit disabled={isSubmitting || !isValid}>
                  {t('common:submit')}
                </ButtonSubmit>
              </Form>
            </div>
          )}
        </Formik>
      </Container>
    </>
  );
};

SSORedirectUri.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

SSORedirectUri.defaultProps = {
  service: null,
};

// CONNECT
const mapDispatchToProps = dispatch => ({
  dispatchUpdateEntities: (mainDomain, changes, history) => {
    const entities = [{ id: mainDomain, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
    history.push(generatePath(PARENT_ROUTE, { mainDomain }));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['service', 'fields', 'common'])(SSORedirectUri));
