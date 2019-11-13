import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import prop from '@misakey/helpers/prop';
import log from '@misakey/helpers/log';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import BoxSection from 'components/dumb/Box/Section';
import ButtonSubmit from 'components/dumb/Button/Submit';
import FormFields from 'components/dumb/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';

import EmailIcon from '@material-ui/icons/Email';

import API from '@misakey/api';
import { accessTokenUpdate } from 'store/actions/accessToken';
import { accessRequestUpdate } from 'store/actions/accessRequest';
import ResponseHandlerWrapper from 'components/dumb/ResponseHandlerWrapper';
import { accessRequestValidationSchema } from 'constants/validationSchemas/auth';

const DEFAULT_FIELDS = { code: { component: FieldCode, label: undefined } };
const INITIAL_VALUES = { code: '' };

// @FIXME: js-common
const ENDPOINTS = {
  databoxes: {
    accessRequest: {
      read: {
        method: 'GET',
        path: '/databoxes/access-request/:token',
      },
    },
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

function AccessRequestFallback({ accessRequest, dispatch, location, t }) {
  const { enqueueSnackbar } = useSnackbar();
  const { hash } = location;

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const [isRequestingCode, setIsRequestingCode] = useState(false);

  const handleEmail = useCallback(() => {
    setIsRequestingCode(true);
    const payload = { accessRequestToken: accessRequest.token };

    API.use(ENDPOINTS.databoxes.confirmationCode.create)
      .build(null, objectToSnakeCase(payload))
      .send()
      .then(() => {
        const text = t('screens:AccessRequest.body.email.success', accessRequest);
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
        dispatch(accessTokenUpdate(objectToCamelCase(response)));
        enqueueSnackbar(t('screens:AccessRequest.body.token.success', accessRequest));
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
  }, [accessRequest, enqueueSnackbar, t, dispatch]);

  const fetchAccessRequest = useCallback(() => {
    if (!isFetching && hash) {
      setIsFetching(true);
      setError(false);
      const query = { token: hash.substr(1) };

      API.use(ENDPOINTS.databoxes.accessRequest.read)
        .build(query)
        .send()
        .then((response) => { dispatch(accessRequestUpdate(objectToCamelCase(response))); })
        .catch((e) => { setError(e); })
        .finally(() => setIsFetching(false));
    }
  }, [hash, setIsFetching, setError, isFetching, dispatch]);

  useEffect(() => {
    if (isEmpty(accessRequest) && !error && hash) { fetchAccessRequest(); }
  }, [hash, accessRequest, error, fetchAccessRequest]);

  return (
    <section id="AccessRequest">
      <ResponseHandlerWrapper
        error={error}
        entity={accessRequest}
        isFetching={isFetching}
      >
        <Container maxWidth="md">
          <BoxSection my={3}>
            <Typography variant="h5" component="h4">
              {t('screens:AccessRequest.body.title', accessRequest)}
            </Typography>
            <Typography>
              {t('screens:AccessRequest.body.confirm.desc', accessRequest)}
            </Typography>
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
                  <Box display="flex" justifyContent="space-between">
                    <ButtonSubmit
                      Icon={EmailIcon}
                      isSubmitting={isRequestingCode}
                      onClick={handleEmail}
                      variant="text"
                      text={t('screens:AccessRequest.body.email.submit')}
                      type="button"
                    />
                    <ButtonSubmit
                      disabled={isSubmitting}
                      isSubmitting={isSubmitting}
                    />
                  </Box>
                </Form>
              )}
            </Formik>
          </BoxSection>
        </Container>
      </ResponseHandlerWrapper>
    </section>
  );
}

AccessRequestFallback.propTypes = {
  accessRequest: PropTypes.shape({
    producerName: PropTypes.string,
    dpoEmail: PropTypes.string,
    ownerName: PropTypes.string,
    ownerEmail: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.shape({
    hash: PropTypes.string.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'screens'])(connect(
  (state) => ({ accessRequest: state.accessRequest }),
)(AccessRequestFallback));
