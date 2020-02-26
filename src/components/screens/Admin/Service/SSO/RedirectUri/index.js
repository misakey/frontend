import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { redirectUriValidationSchema } from 'constants/validationSchemas/sso';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';
import ScreenAction from 'components/dumb/Screen/Action';

// CONSTANTS
const PARENT_ROUTE = routes.admin.service.sso._;

// HELPERS
const createApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.create)
  .build(null, objectToSnakeCase({ ...form, clientId: id, allowedCorsOrigins: [] }))
  .send();

const updateApplicationSSO = (id, form) => API
  .use(API.endpoints.sso.update)
  .build({ id }, objectToSnakeCase(form))
  .send();

const redirectUriToList = (redirectUriString) => [redirectUriString];
const listToRedirectUri = (redirectUriList) => {
  if (isArray(redirectUriList)) {
    const redirectUri = redirectUriList[0];
    return isNil(redirectUri) ? '' : redirectUri;
  }
  return '';
};

const getRedirectUri = (service) => (isNil(service) ? '' : listToRedirectUri(service.redirectUris));

// HOOKS
const useOnSubmit = (
  service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t,
) => useCallback(
  (
    { redirectUris }, { setSubmitting },
  ) => {
    const form = { redirectUris: redirectUriToList(redirectUris) };
    const alreadyExists = !isNil(service.redirectUris);
    return (alreadyExists
      ? updateApplicationSSO(service.id, form)
      : createApplicationSSO(service.id, form))
      .then((response) => {
        const update = isNil(response) ? form : { ...form, ...objectToCamelCase(response) };
        enqueueSnackbar(t('admin__new:sso.redirectUri.success'), { variant: 'success' });
        dispatchUpdateEntities(service.mainDomain, update, history);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus || 500;
        setError(httpStatus);
      })
      .finally(() => { setSubmitting(false); });
  },
  [service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const SSORedirectUri = ({ appBarProps, t, service, dispatchUpdateEntities, history }) => {
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

  const initialValues = useMemo(
    () => ({ redirectUris }),
    [redirectUris],
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
      history={history}
      navigationProps={{ homePath }}
      appBarProps={appBarProps}
      title={t('admin__new:sso.redirectUri.title')}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('admin__new:sso.redirectUri.subtitle')}
        </Typography>
        <Formik
          validationSchema={redirectUriValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-end" component={Form}>
            <Field
              className="field"
              type="url"
              name="redirectUris"
              autoFocus
              component={FieldText}
              label={t('fields__new:redirectUris.label')}
            />
            <Box mt={1}>
              <ButtonSubmit>
                {t('common__new:submit')}
              </ButtonSubmit>
            </Box>
          </Box>
        </Formik>
      </Container>
    </ScreenAction>
  );
};

SSORedirectUri.propTypes = {
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

SSORedirectUri.defaultProps = {
  appBarProps: null,
  service: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateEntities: (mainDomain, changes, history) => {
    const entities = [{ id: mainDomain, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
    history.push(generatePath(PARENT_ROUTE, { mainDomain }));
  },
});

export default connect(null, mapDispatchToProps)(
  withTranslation(['admin__new', 'fields__new', 'common__new'])(SSORedirectUri),
);
