import React, { useCallback, useState, useMemo } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { connect } from 'react-redux';

import API from '@misakey/api';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import useGetRoles from '@misakey/auth/hooks/useGetRoles';
import { loadUserRoles } from '@misakey/auth/store/actions/auth';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import EmailIcon from '@material-ui/icons/Email';
import Button from '@material-ui/core/Button';

import BoxSection from 'components/dumb/Box/Section';
import ButtonSubmit from 'components/dumb/Button/Submit';
import ResponseHandlerWrapper from 'components/dumb/ResponseHandlerWrapper';
import FormFields from 'components/dumb/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import BoxMessage from 'components/dumb/Box/Message';
import Redirect from 'components/dumb/Redirect';

import routes from 'routes';
import errorTypes from 'constants/errorTypes';

import useLocationWorkspace from 'hooks/useLocationWorkspace';

import { serviceClaimValidationSchema } from 'constants/validationSchemas/dpo';

const { conflict } = errorTypes;

// @FIXME: add to @misakey/API
export const ENDPOINTS = {
  claim: {
    create: {
      method: 'POST',
      path: '/user-role-claims',
      auth: true,
    },
    confirm: {
      update: {
        method: 'PATCH',
        path: '/user-role-claims/:id',
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

function ServiceRoleClaim({ service, t, userId, dispatchUserRoles, userRoles }) {
  const { enqueueSnackbar } = useSnackbar();

  const role = useLocationWorkspace();

  const [errorMessage, setErrorMessage] = useState();
  const [claim, setClaim] = useState(null);
  // @FIXME: useless here but fixed in incoming WIP MR
  const [error] = useState();
  const [isFetching] = useState(false);
  const [isCreating, setCreating] = useState(false);
  const fetchRoleList = useGetRoles(dispatchUserRoles);
  const { valid: userHasRole } = useMemo(
    () => {
      const { id } = service;
      const userRole = userRoles.find(
        ({ applicationId, roleLabel }) => applicationId === id && roleLabel === role,
      );
      return (userRole) || { id: null, valid: false };
    },
    [service, userRoles, role],
  );
  const pathToDpoHome = useMemo(
    () => generatePath(routes.dpo.service._, { mainDomain: service.mainDomain }),
    [service.mainDomain],
  );
  const [success, setSuccess] = useState(false);

  const handleEmail = useCallback(() => {
    if (isNil(service) || isCreating) { return; }
    setCreating(true);
    setErrorMessage();

    const payload = {
      user_role: {
        user_id: userId,
        application_id: service.id,
        role_label: role,
      },
      type: 'email_confirmation_code',
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
  }, [service, isCreating, userId, role, t, enqueueSnackbar]);

  const handleSubmit = useCallback((values, { setErrors, setSubmitting }) => {
    if (isNil(claim) || isNil(claim.id)) { return; }

    setSubmitting(true);

    const query = { id: claim.id };
    const payload = { validated_at: moment.utc(Date.now()).format(), value: values.code.join('') };

    API.use(ENDPOINTS.claim.confirm.update)
      .build(query, payload)
      .send()
      .then(() => {
        setSuccess(true);
        fetchRoleList(userId);
      })
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
  }, [claim, enqueueSnackbar, fetchRoleList, t, userId]);

  if (userHasRole) {
    enqueueSnackbar(t('screens:Service.Role.Claim.info.alreadyDpo', { mainDomain: service.mainDomain, role }), { variant: 'info' });
    return <Redirect to={pathToDpoHome} />;
  }

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
            {isEmpty(service.dpoEmail) && (
              <>
                <BoxMessage
                  mt={1}
                  type="error"
                  text={t('screens:Service.Role.Claim.body.content.errors.missingDpoEmail.text', { mainDomain: service.mainDomain })}
                />
                <Box align="right" mt={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                    component="a"
                    href="mailto:love@misakey.com"
                  >
                    {t('screens:Service.Role.Claim.body.content.errors.missingDpoEmail.button')}
                  </Button>
                </Box>
              </>
            )}
            {!isEmpty(service.dpoEmail) && (
              <>
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
                          to={
                            generatePath(routes.dpo.service._, { mainDomain: service.mainDomain })
                          }
                        >
                          {t('next')}
                        </Button>
                        )}
                      </Box>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </BoxSection>
        </Container>
      </ResponseHandlerWrapper>
    </section>
  );
}

ServiceRoleClaim.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
    dpoEmail: PropTypes.string,
  }),
  t: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  dispatchUserRoles: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
};

ServiceRoleClaim.defaultProps = {
  service: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchUserRoles: (roles) => dispatch(loadUserRoles(roles)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens', 'fields'])(ServiceRoleClaim));
