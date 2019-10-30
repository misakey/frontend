import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import API from '@misakey/api';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import EmailIcon from '@material-ui/icons/Email';

import BoxSection from '@misakey/ui/Box/Section';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import FormFields from '@misakey/ui/Form/Fields';
import FieldCode from '@misakey/ui/Form/Field/Code';
import BoxMessage from '@misakey/ui/Box/Message';
import Button from '@material-ui/core/Button';

import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { serviceClaimValidationSchema } from 'constants/validationSchemas/dpo';

const { conflict } = errorTypes;

// @FIXME: add to @misakey/API
export const ENDPOINTS = {
  claim: {
    pending: {
      list: {
        method: 'GET',
        path: '/pending-claims',
        auth: true,
      },
    },
    create: {
      method: 'POST',
      path: '/application-role-claims',
      auth: true,
    },
    confirm: {
      update: {
        method: 'PATCH',
        path: '/application-role-claims/:id',
        auth: true,
      },
    },
  },
};

const defaultFields = {
  code: { component: FieldCode, label: undefined },
};

const initialValues = {
  code: '',
};

const ServiceRoleClaimFormFields = (fields) => (
  <FormFields fields={fields} prefix="serviceRoleClaim." defaultFields={defaultFields} />
);

ServiceRoleClaimFormFields.defaultProps = defaultFields;

function ServiceRoleClaim({ match, service, t, userId }) {
  const { enqueueSnackbar } = useSnackbar();

  const { role = 'dpo' } = match.params;

  const [error, setError] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [claim, setClaim] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [isCreating, setCreating] = useState(false);

  const handleEmail = useCallback(() => {
    if (isNil(service) || isCreating) { return; }
    setCreating(true);
    setErrorMessage();

    const payload = {
      user_id: userId,
      application_id: service.id,
      role_label: role,
      valid: false,
    };

    API.use(ENDPOINTS.claim.create)
      .build(null, payload)
      .send()
      .then((response) => {
        setClaim(objectToCamelCase(response));

        const text = t(
          'screens:Service.Role.Claim.body.email.success',
          { mainDomain: service.mainDomain },
        );
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        if (e.code === conflict) {
          setErrorMessage(t(`fields:serviceRoleClaim.code.error.${conflict}`));
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => setCreating(false));
  }, [userId, service, setCreating, setClaim, enqueueSnackbar, t, isCreating, role]);

  const handleSubmit = useCallback((values, { setErrors, setSubmitting }) => {
    if (isNil(claim) || isNil(claim.id)) { return; }

    setSubmitting(true);

    const query = { id: claim.id };
    const payload = { valid: true, confirmation_code: values.code.join('') };

    API.use(ENDPOINTS.claim.confirm.update)
      .build(query, payload)
      .send()
      .then(() => { setSuccess(true); })
      .catch((e) => {
        const details = prop('details')(e);
        if (details) {
          setErrors({ code: details.confirmation_code });
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => setSubmitting(false));
  }, [claim, enqueueSnackbar, t]);

  const fetchClaims = useCallback(() => {
    setFetching(true);
    const queryParams = { user_id: userId };

    API.use(ENDPOINTS.claim.pending.list)
      .build(null, null, queryParams)
      .send()
      .then((response) => {
        const found = (response.application_role_claims || [])
          .find((item) => item.role_label === role);
        if (found) { setClaim(objectToCamelCase(found)); }
      })
      .catch(setError)
      .finally(() => setFetching(false));
  }, [setFetching, setClaim, setError, role, userId]);

  useEffect(fetchClaims, []);

  return (
    <section id="ServiceRoleClaim">
      <ResponseHandlerWrapper error={error} entity={service} isFetching={isFetching}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h3" align="center">
            {t('screens:Service.Role.Claim.body.title', service)}
          </Typography>
          <Typography
            align="center"
            variant="subtitle1"
            color="textSecondary"
            gutterBottom
          >
            {t('screens:Service.Role.Claim.body.subTitle')}
          </Typography>
          <BoxSection mt={3}>
            <Typography variant="h5" component="h4">
              {t('screens:Service.Role.Claim.body.content.title')}
            </Typography>
            <Typography>
              {t('screens:Service.Role.Claim.body.content.desc', service)}
            </Typography>
            {success && (
              <BoxMessage
                mt={1}
                type="success"
                text={t('screens:Service.Role.Claim.body.success', service)}
              />
            )}
            {errorMessage && (
              <BoxMessage
                mt={1}
                type="error"
                text={errorMessage}
              />
            )}
            <Formik
              initialValues={initialValues}
              validationSchema={serviceClaimValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ isValid, isSubmitting }) => (
                <Form>
                  <ServiceRoleClaimFormFields />
                  <Box display="flex" justifyContent="space-between">
                    <ButtonSubmit
                      type="button"
                      disabled={success}
                      Icon={EmailIcon}
                      isSubmitting={isCreating}
                      onClick={handleEmail}
                      variant="text"
                      text={t('screens:Service.Role.Claim.body.email.submit')}
                    />
                    {!success && (
                      <ButtonSubmit
                        disabled={!isValid}
                        isSubmitting={isSubmitting}
                      />
                    )}
                    {success && (
                      <Button
                        variant="contained"
                        color="secondary"
                        component={Link}
                        to={generatePath(routes.dpo.service._, { mainDomain: service.mainDomain })}
                      >
                        {t('next')}
                      </Button>
                    )}
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

ServiceRoleClaim.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      role: PropTypes.string,
    }),
  }).isRequired,
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

ServiceRoleClaim.defaultProps = {
  service: null,
};

export default withTranslation(['common', 'screens', 'fields'])(ServiceRoleClaim);
