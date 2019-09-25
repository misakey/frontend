import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { allowedOriginsForm } from 'constants/validationSchemas/sso';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';
import isArray from '@misakey/helpers/isArray';
import split from '@misakey/helpers/split';
import join from '@misakey/helpers/join';

import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from '@misakey/ui/Navigation';
import FieldText from '@misakey/ui/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ScreenError from 'components/screen/Error';

const PARENT_ROUTE = routes.service.sso._;

// HELPERS
const createApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.create)
  .build(null, objectToSnakeCase({ ...form, clientId: id, redirectUris: [] }))
  .send();

const updateApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

const allowedOriginsToList = originsString => (isString(originsString) ? split(originsString, ';') : []);
const listToAllowedOrigins = originsList => (isArray(originsList) ? join(originsList, ';') : '');

// HOOKS
const useOnSubmit = (
  service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t,
) => useCallback((
  { allowedCorsOrigins }, { setSubmitting },
) => {
  const form = { allowedCorsOrigins: allowedOriginsToList(allowedCorsOrigins) };
  const alreadyExists = !isNil(service.allowedCorsOrigins);
  return (alreadyExists
    ? updateApplicationSSO(service.id, form)
    : createApplicationSSO(service.id, form))
    .then(({ body }) => {
      const update = isNil(body) ? form : { ...form, ...objectToCamelCase(body) };
      enqueueSnackbar(t('service:sso.allowedOrigins.success'), { variant: 'success' });
      dispatchUpdateEntities(service.mainDomain, update, history);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus ? error.httpStatus : 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); });
},
[service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t]);

// COMPONENTS
const SSOAllowedOrigins = ({
  t,
  service,
  dispatchUpdateEntities,
  history,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const allowedCorsOrigins = useMemo(
    () => listToAllowedOrigins(service.allowedCorsOrigins),
    [service],
  );

  const onSubmit = useOnSubmit(
    service,
    dispatchUpdateEntities,
    enqueueSnackbar,
    setError,
    history,
    t,
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
      <Navigation
        history={history}
        pushPath={pushPath}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('service:sso.allowedOrigins.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('service:sso.allowedOrigins.subtitle')}
        </Typography>
        <Formik
          validationSchema={allowedOriginsForm}
          onSubmit={onSubmit}
          initialValues={{ allowedCorsOrigins }}
        >
          {({ isSubmitting, isValid }) => (
            <Box display="flex" flexDirection="column" alignItems="flex-end" component={Form}>
              <Field
                className="field"
                type="url"
                multiline
                name="allowedCorsOrigins"
                autoFocus
                component={FieldText}
                label={t('fields:allowedCorsOrigins.label')}
                helperText={t('fields:allowedCorsOrigins.helperText')}
              />
              <Box mt={1}>
                <ButtonSubmit disabled={isSubmitting || !isValid}>
                  {t('common:submit')}
                </ButtonSubmit>
              </Box>
            </Box>
          )}
        </Formik>
      </Container>
    </>
  );
};

SSOAllowedOrigins.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

SSOAllowedOrigins.defaultProps = {
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

export default connect(null, mapDispatchToProps)(withTranslation(['service', 'fields', 'common'])(SSOAllowedOrigins));
