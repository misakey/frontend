import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { normalize } from 'normalizr';
import { generatePath } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';

import routes from 'routes';
import errorTypes from 'constants/errorTypes';
import { mainDomainValidationSchema, MAIN_DOMAIN_REGEX } from 'constants/validationSchemas/information';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import ApplicationSchema from 'store/schemas/Application';
import { layoutAppbarHide, layoutAppbarShow } from 'store/actions/Layout';
import { receiveEntities } from '@misakey/store/actions/entities';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Navigation from 'components/dumb/Navigation';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';

// CONSTANTS
const { badRequest } = errorTypes;
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';
const APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-info',
  auth: true,
};

const INITIAL_VALUES = {
  [MAIN_DOMAIN_FIELD_NAME]: '',
};

// HELPERS
const getMainDomainError = prop('main_domain');

const createApplication = (form) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase(form))
  .send();

const goToApplicationInfo = (application, history) => {
  const { mainDomain } = application;
  history.push(generatePath(routes.citizen.application.info, { mainDomain }));
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
  dispatchLayoutAppBar,
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
        // fix to ensure app bar is displayed before changing screen
        dispatchLayoutAppBar(true);
        goToApplicationInfo(application, history);
      })
      .catch(({ httpStatus, code, details }) => {
        if (httpStatus === 409) {
          dispatchLayoutAppBar(true);
          goToApplicationInfo(form, history);
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
    dispatchLayoutAppBar,
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
  dispatchLayoutAppBar,
  t,
}) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();

  const onSubmit = useOnSubmit(
    dispatchApplicationCreate,
    dispatchLayoutAppBar,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  useEffect(
    () => {
      dispatchLayoutAppBar(false);
      return () => { dispatchLayoutAppBar(true); };
    },
    [dispatchLayoutAppBar],
  );

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <>
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
          initialValues={INITIAL_VALUES}
        >
          {({ isSubmitting, isValid }) => (
            <Container maxWidth="sm">
              <Form className={classes.form}>
                <Field
                  type="text"
                  name={MAIN_DOMAIN_FIELD_NAME}
                  inputProps={{
                    autoComplete: 'off',
                  }}
                  component={FieldText}
                  label={t('fields:mainDomain.altLabel')}
                  helperText={t('fields:mainDomain.helperText')}
                />
                <ButtonSubmit isSubmitting={isSubmitting} isValid={isValid}>
                  {t('submit')}
                </ButtonSubmit>
              </Form>
            </Container>
          )}
        </Formik>
      </Container>
    </>
  );
};

ApplicationsCreate.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  dispatchApplicationCreate: PropTypes.func.isRequired,
  dispatchLayoutAppBar: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchLayoutAppBar: (show) => {
    const action = show ? layoutAppbarShow : layoutAppbarHide;
    dispatch(action());
  },
  dispatchApplicationCreate: (application) => {
    const normalized = normalize(application, ApplicationSchema.entity);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation('screens')(ApplicationsCreate));
