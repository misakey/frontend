import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { allowedOriginsValidationSchema } from 'constants/validationSchemas/sso';

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
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';
import ScreenAction from 'components/dumb/Screen/Action';

const PARENT_ROUTE = routes.admin.service.sso._;

// HELPERS
const createApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.create)
  .build(null, objectToSnakeCase({ ...form, clientId: id, redirectUris: [] }))
  .send();

const updateApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

const allowedOriginsToList = (originsString) => (isString(originsString) ? split(originsString, ';') : []);
const listToAllowedOrigins = (originsList) => (isArray(originsList) ? join(originsList, ';') : '');

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
    .then((response) => {
      const update = isNil(response) ? form : { ...form, ...objectToCamelCase(response) };
      enqueueSnackbar(t('admin:sso.allowedOrigins.success'), { variant: 'success' });
      dispatchUpdateEntities(service.mainDomain, update, history);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus || 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); });
},
[service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t]);

// COMPONENTS
const SSOAllowedOrigins = ({ appBarProps, t, service, dispatchUpdateEntities, history }) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const allowedCorsOrigins = useMemo(
    () => listToAllowedOrigins(service.allowedCorsOrigins),
    [service],
  );

  const initialValues = useMemo(
    () => ({ allowedCorsOrigins }),
    [allowedCorsOrigins],
  );

  const onSubmit = useOnSubmit(
    service,
    dispatchUpdateEntities,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  const homePath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <ScreenAction
      navigationProps={{ homePath }}
      appBarProps={appBarProps}
      title={t('admin:sso.allowedOrigins.title')}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('admin:sso.allowedOrigins.subtitle')}
        </Typography>
        <Formik
          validationSchema={allowedOriginsValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
        >
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
              <ButtonSubmit>
                {t('common:submit')}
              </ButtonSubmit>
            </Box>
          </Box>
        </Formik>
      </Container>
    </ScreenAction>
  );
};

SSOAllowedOrigins.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape(ServiceSchema.propTypes),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

SSOAllowedOrigins.defaultProps = {
  appBarProps: null,
  service: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateEntities: (mainDomain, changes, history) => {
    const entities = [{ id: mainDomain, changes }];
    dispatch(updateEntities(entities, ServiceSchema));
    history.push(generatePath(PARENT_ROUTE, { mainDomain }));
  },
});

export default connect(null, mapDispatchToProps)(
  withTranslation(['admin', 'fields', 'common'])(SSOAllowedOrigins),
);
