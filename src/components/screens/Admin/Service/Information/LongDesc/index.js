import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Field, Form } from 'formik';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';

import routes from 'routes';
import { longDescValidationSchema } from 'constants/validationSchemas/information';

import ServiceSchema from 'store/schemas/Service';
import { updateEntities } from '@misakey/store/actions/entities';

import isNil from '@misakey/helpers/isNil';
import propOr from '@misakey/helpers/propOr';
import generatePath from '@misakey/helpers/generatePath';

import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ScreenError from 'components/dumb/Screen/Error';
import ScreenAction from 'components/dumb/Screen/Action';

const PARENT_ROUTE = routes.admin.service.information._;

// @FIXME js-common
const INFO_UPDATE_ENDPOINT = {
  method: 'PATCH',
  path: '/application-info/:id',
  auth: true,
};

// HELPERS
const longDescProp = propOr('', 'longDesc');

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
      enqueueSnackbar(t('admin:information.longDesc.success'), { variant: 'success' });
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
const ServiceLongDesc = ({ appBarProps, t, service, dispatchUpdateEntities, history }) => {
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

  const homePath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  const longDesc = useMemo(
    () => longDescProp(service),
    [service],
  );

  const initialValues = useMemo(
    () => ({ longDesc }),
    [longDesc],
  );

  if (isNil(service)) { return null; }


  if (error) {
    return <ScreenError httpStatus={error} />;
  }
  return (
    <ScreenAction
      id="ServiceInformationLongDesc"
      navigationProps={{ homePath }}
      appBarProps={appBarProps}
      title={t('admin:information.longDesc.title')}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
          {t('admin:information.longDesc.subtitle')}
        </Typography>
        <Formik
          validationSchema={longDescValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
        >
          <Box display="flex" flexDirection="column" alignItems="flex-end" component={Form}>
            <Field
              className="field"
              name="longDesc"
              autoFocus
              multiline
              component={FieldText}
              label={t('fields:longDesc.label')}
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

ServiceLongDesc.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({ longDesc: PropTypes.string, mainDomain: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
  dispatchUpdateEntities: PropTypes.func.isRequired,
};

ServiceLongDesc.defaultProps = {
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

export default connect(null, mapDispatchToProps)(withTranslation(['admin', 'fields', 'common'])(ServiceLongDesc));
