import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { longDescForm } from 'constants/validationSchemas/information';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import isNil from '@misakey/helpers/isNil';
import generatePath from '@misakey/helpers/generatePath';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from '@misakey/ui/Navigation';
import FieldText from '@misakey/ui/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ScreenError from 'components/screen/Error';

import './index.scss';

// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
};

const PARENT_ROUTE = routes.service.information._;

// @FIXME js-common
const INFO_UPDATE_ENDPOINT = {
  method: 'PATCH',
  path: '/application-info/:id',
  auth: true,
};

// HELPERS
const updateApplicationInfo = (id, form) => API
  .use(INFO_UPDATE_ENDPOINT)
  .build({ id }, objectToSnakeCase(form))
  .send();

// HOOKS
const useOnSubmit = (
  service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateApplicationInfo(service.id, form)
    .then(() => {
      enqueueSnackbar(t('service:longDesc.success'), { variant: 'success' });
      dispatchUpdateEntities(service.mainDomain, form, history);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus ? error.httpStatus : 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const ServiceLongDesc = ({
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

  if (isNil(service)) { return null; }

  const { longDesc } = service;

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <div className="LongDesc">
      <div className="header">
        <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={PARENT_ROUTE} hideBackButton={false} title={t('service:longDesc.title')} />
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('service:longDesc.subtitle')}
        </Typography>
      </div>
      {longDesc && (
        <Formik
          validationSchema={longDescForm}
          onSubmit={onSubmit}
          initialValues={{ longDesc }}
        >
          {({ isSubmitting, isValid }) => (
            <Container maxWidth="sm" className="content">
              <Form className="form">
                <Field
                  className="field"
                  type="text"
                  name="longDesc"
                  autoFocus
                  multiline
                  component={FieldText}
                  label={t('fields:longDesc.label')}
                />
                <ButtonSubmit disabled={isSubmitting || !isValid}>
                  {t('common:submit')}
                </ButtonSubmit>
              </Form>
            </Container>
          )}
        </Formik>
      )}
    </div>
  );
};

ServiceLongDesc.propTypes = {
  service: PropTypes.shape({ longDesc: PropTypes.string, mainDomain: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

ServiceLongDesc.defaultProps = {
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

export default connect(null, mapDispatchToProps)(withTranslation(['service', 'fields', 'common'])(ServiceLongDesc));
