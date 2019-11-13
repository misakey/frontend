import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { shortDescValidationSchema } from 'constants/validationSchemas/information';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from 'components/dumb/Navigation';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';

const PARENT_ROUTE = routes.admin.service.information._;

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
      enqueueSnackbar(t('service:information.shortDesc.success'), { variant: 'success' });
      dispatchUpdateEntities(service.mainDomain, form, history);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus || 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [service, dispatchUpdateEntities, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
const ServiceShortDesc = ({
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

  const pushPath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  const { shortDesc } = service;

  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <div id="ServiceInformationShortDesc">
      <Navigation
        history={history}
        pushPath={pushPath}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('service:information.shortDesc.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('service:information.shortDesc.subtitle')}
        </Typography>
        <Formik
          validationSchema={shortDescValidationSchema}
          onSubmit={onSubmit}
          initialValues={{ shortDesc }}
        >
          {({ isSubmitting, isValid }) => (
            <Box display="flex" flexDirection="column" alignItems="flex-end" component={Form}>
              <Field
                className="field"
                type="text"
                name="shortDesc"
                autoFocus
                component={FieldText}
                label={t('fields:shortDesc.label')}
                helperText={t('fields:shortDesc.helperText')}
                t={t}
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
    </div>
  );
};

ServiceShortDesc.propTypes = {
  service: PropTypes.shape({ shortDesc: PropTypes.string, mainDomain: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

ServiceShortDesc.defaultProps = {
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

export default connect(null, mapDispatchToProps)(withTranslation(['service', 'fields', 'common'])(ServiceShortDesc));
