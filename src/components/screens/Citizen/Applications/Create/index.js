import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { normalize } from 'normalizr';
import { generatePath, useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { mainDomainValidationSchema, MAIN_DOMAIN_REGEX } from 'constants/validationSchemas/information';

import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

import useSuspenseMaterialFix from '@misakey/hooks/useSuspenseMaterialFix';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Navigation from 'components/dumb/Navigation';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';
import Screen from 'components/dumb/Screen';


// CONSTANTS
const { badRequest } = errorTypes;
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';
const APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-info',
  auth: true,
};

// HELPERS
const getMainDomainError = prop('main_domain');

const createApplication = (form) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase(form))
  .send();

const goToApplicationVault = (application, history) => {
  const { mainDomain } = application;
  history.push(generatePath(routes.citizen.application.vault, { mainDomain }));
};

// HOOKS
const useStyles = makeStyles(() => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
}));

const useOnSubmit = (
  dispatchApplicationCreate,
  enqueueSnackbar,
  setError,
  history,
  t,
) => useCallback(
  ({ mainDomain }, { setSubmitting, setFieldError }) => {
    const matchedRegex = MAIN_DOMAIN_REGEX.exec(mainDomain);
    const form = { mainDomain: matchedRegex[1] };
    return createApplication(form)
      .then((response) => {
        const application = objectToCamelCase(response);
        enqueueSnackbar(t('screens:applications.create.success'), { variant: 'success' });
        dispatchApplicationCreate(application);

        goToApplicationVault(application, history);
      })
      .catch(({ httpStatus, code, details }) => {
        if (httpStatus === 409) {
          goToApplicationVault(form, history);
        } else {
          const mainDomainError = getMainDomainError(details);
          if (code === badRequest && !isNil(mainDomainError)) {
            setFieldError(MAIN_DOMAIN_FIELD_NAME, mainDomainError);
          } else {
            setError(httpStatus);
          }
        }
      })
      .finally(() => { setSubmitting(false); });
  },
  [
    dispatchApplicationCreate,
    enqueueSnackbar,
    setError,
    history,
    t,
  ],
);

// COMPONENTS
const ApplicationsCreate = ({
  history,
  dispatchApplicationCreate,
  t,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  // WARNING: this is an ugly hook for workaround, use it with precaution
  const { ref, key } = useSuspenseMaterialFix();

  const { search } = useLocation();

  const { prefill } = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const initialValues = useMemo(
    () => ({ [MAIN_DOMAIN_FIELD_NAME]: isNil(prefill) ? '' : prefill }),
    [prefill],
  );

  const isInitialValid = useMemo(
    () => (mainDomainValidationSchema.isValidSync(initialValues)),
    [initialValues],
  );

  const onSubmit = useOnSubmit(
    dispatchApplicationCreate,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Screen>
      <Navigation
        toolbarProps={{ maxWidth: 'md' }}
        history={history}
        title={t('screens:applications.create.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" align="left">
          {t('screens:applications.create.subtitle')}
        </Typography>
        <Formik
          validationSchema={mainDomainValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
          isInitialValid={isInitialValid}
          enableReinitialize
        >
          {({ isSubmitting, isValid }) => (
            <Container maxWidth="sm">
              <Form className={classes.form}>
                <Field
                  type="text"
                  inputRef={ref}
                  key={key}
                  name={MAIN_DOMAIN_FIELD_NAME}
                  inputProps={{
                    autoComplete: 'off',
                  }}
                  component={FieldText}
                  label={t('fields:mainDomain.altLabel')}
                  helperText={t('fields:mainDomain.helperText')}
                />
                <ButtonSubmit isSubmitting={isSubmitting} isValid={isValid}>
                  {t('common:submit')}
                </ButtonSubmit>
              </Form>
            </Container>
          )}
        </Formik>
      </Container>
    </Screen>
  );
};

ApplicationsCreate.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  dispatchApplicationCreate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchApplicationCreate: (application) => {
    const normalized = normalize(application, ApplicationSchema.entity);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['screens', 'common', 'fields'])(ApplicationsCreate));
