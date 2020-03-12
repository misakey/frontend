import React, { useMemo, useState, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';

import { logoValidationSchema } from 'constants/validationSchemas/information';
import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import isNil from '@misakey/helpers/isNil';
import pick from '@misakey/helpers/pick';
import generatePath from '@misakey/helpers/generatePath';
import toFormData from '@misakey/helpers/toFormData';

import API from '@misakey/api';

import ScreenError from 'components/dumb/Screen/Error';
import Screen from 'components/dumb/Screen';

// LAZY
const ServiceLogoDisplay = lazy(() => import('components/screens/Admin/Service/Information/Logo/Display'));
const ServiceLogoUpload = lazy(() => import('components/screens/Admin/Service/Information/Logo/Upload'));

// CONSTANTS
const INITIAL_VALUES = {
  logo: null,
};

const PARENT_ROUTE = routes.admin.service.information._;

// @FIXME js-common
const LOGO_UPDATE_ENDPOINT = {
  method: 'PUT',
  path: '/application-info/:id/logo',
  auth: true,
};

// HELPERS
const pickForm = pick(Object.keys(INITIAL_VALUES));

const updateLogo = (id, form) => API
  .use(LOGO_UPDATE_ENDPOINT)
  .build({ id }, toFormData(form))
  .send();

// HOOKS
const useOnSubmit = (
  service, dispatchUpdate, enqueueSnackbar, setError, history, t,
) => useMemo(
  () => (form, { setSubmitting }) => updateLogo(service.id, pickForm(form))
    .then(() => {
      enqueueSnackbar(t('admin:information.logo.success'), { variant: 'success' });
      const changes = { logoUri: form.preview };
      dispatchUpdate(service.mainDomain, changes, history);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus || 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [service, dispatchUpdate, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const ServiceLogo = ({ appBarProps, t, service, dispatchUpdate, history }) => {
  const [error, setError] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = useOnSubmit(
    service,
    dispatchUpdate,
    enqueueSnackbar,
    setError,
    history,
    t,
  );

  if (isNil(service)) { return null; }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <Screen className="Avatar" appBarProps={appBarProps}>
      <Formik
        validationSchema={logoValidationSchema}
        onSubmit={onSubmit}
        initialValues={INITIAL_VALUES}
      >
        {(formikProps) => (
          <Form className="form">
            <Switch>
              <Route
                exact
                path={routes.admin.service.information.logo._}
                render={(routerProps) => (
                  <ServiceLogoDisplay
                    service={service}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
              <Route
                exact
                path={routes.admin.service.information.logo.upload}
                render={(routerProps) => (
                  <ServiceLogoUpload
                    service={service}
                    {...formikProps}
                    {...routerProps}
                  />
                )}
              />
            </Switch>
          </Form>
        )}
      </Formik>
    </Screen>
  );
};

ServiceLogo.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({
    id: PropTypes.string,
    logoUri: PropTypes.string,
    name: PropTypes.string,
  }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdate: PropTypes.func.isRequired,
};

ServiceLogo.defaultProps = {
  appBarProps: null,
  service: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdate: (mainDomain, changes, history) => {
    const entities = [{ id: mainDomain, changes }];
    dispatch(updateEntities(entities, ServiceSchema.entity));
    history.push(generatePath(PARENT_ROUTE, { mainDomain }));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation('admin')(ServiceLogo));
