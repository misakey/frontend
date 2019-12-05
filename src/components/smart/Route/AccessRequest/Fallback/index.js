import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import { accessTokenUpdate } from 'store/actions/access';
import { accessRequestValidationSchema } from 'constants/validationSchemas/auth';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import log from '@misakey/helpers/log';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import BoxControls from 'components/dumb/Box/Controls';
import Container from '@material-ui/core/Container';
import Subtitle from 'components/dumb/Typography/Subtitle';
import FormFields from 'components/dumb/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import ScreenAction from 'components/dumb/Screen/Action';

// CONSTANTS
const DEFAULT_FIELDS = { code: { component: FieldCode, label: undefined } };
const INITIAL_VALUES = { code: '' };

// @FIXME: js-common
const ENDPOINTS = {
  databoxes: {
    confirmationCode: {
      create: {
        method: 'POST',
        path: '/databoxes/confirmation-code',
      },
    },
    accessToken: {
      create: {
        method: 'POST',
        path: '/databoxes/access-token',
      },
    },
  },
};

// HELPERS
const getOwnerEmail = path(['owner', 'email']);

// COMPONENTS
function AccessRequestFallback({ accessRequest, dispatchAccessTokenUpdate, isFetching, error, t }) {
  const { enqueueSnackbar } = useSnackbar();

  const [isRequestingCode, setIsRequestingCode] = useState(false);

  const appBarProps = useMemo(
    () => ({
      withUser: false,
      withSearchBar: false,
    }),
    [],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isFetching,
    }),
    [error, isFetching],
  );

  const ownerEmail = useMemo(
    () => getOwnerEmail(accessRequest),
    [accessRequest],
  );

  const handleEmail = useCallback(() => {
    setIsRequestingCode(true);
    const payload = { accessRequestToken: accessRequest.token };

    API.use(ENDPOINTS.databoxes.confirmationCode.create)
      .build(null, objectToSnakeCase(payload))
      .send()
      .then(() => {
        const text = t('screens:accessRequest.email.success', accessRequest);
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(() => setIsRequestingCode(false));
  }, [accessRequest, enqueueSnackbar, t]);

  const handleSubmit = useCallback((values, { setSubmitting, setErrors }) => {
    setSubmitting(true);

    const payload = {
      confirmationCode: values.code.join(''),
      accessRequestToken: accessRequest.token,
    };

    API.use(ENDPOINTS.databoxes.accessToken.create)
      .build(null, objectToSnakeCase(payload))
      .send()
      .then((response) => {
        dispatchAccessTokenUpdate(objectToCamelCase(response));
        enqueueSnackbar(t('screens:accessRequest.token.success', { ownerEmail }), { variant: 'success' });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setErrors({ code: details.confirmation_code });
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => setSubmitting(false));
  }, [accessRequest.token, dispatchAccessTokenUpdate, enqueueSnackbar, t, ownerEmail]);

  return (
    <ScreenAction
      appBarProps={appBarProps}
      state={state}
      title={t('screens:accessRequest.title', { ownerEmail })}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('screens:accessRequest.subtitle', accessRequest)}
        </Subtitle>
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={accessRequestValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormFields
                fields={DEFAULT_FIELDS}
                prefix="AccessRequest."
                defaultFields={DEFAULT_FIELDS}
              />
              <BoxControls
                mt={3}
                secondary={{
                  type: 'button',
                  isLoading: isRequestingCode,
                  text: t('screens:accessRequest.email.submit'),
                  onClick: handleEmail,
                }}
                primary={{
                  type: 'submit',
                  isLoading: isSubmitting,
                  text: t('common:submit'),
                }}
              />
            </Form>
          )}
        </Formik>
      </Container>
    </ScreenAction>
  );
}

AccessRequestFallback.propTypes = {
  accessRequest: PropTypes.shape({
    producerName: PropTypes.string,
    dpoEmail: PropTypes.string,
    ownerName: PropTypes.string,
    ownerEmail: PropTypes.string,
    token: PropTypes.string,
  }),
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),
  dispatchAccessTokenUpdate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

AccessRequestFallback.defaultProps = {
  accessRequest: null,
  error: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchAccessTokenUpdate: (accessToken) => {
    dispatch(accessTokenUpdate(accessToken));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(AccessRequestFallback));
