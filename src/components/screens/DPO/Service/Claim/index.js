import React, { useMemo, useCallback, useState, useEffect } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { connect } from 'react-redux';

import API from '@misakey/api';
import { loadUserRoles } from '@misakey/auth/store/actions/auth';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import head from '@misakey/helpers/head';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useGetRoles from '@misakey/auth/hooks/useGetRoles';

import BoxControls from 'components/dumb/Box/Controls';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import FormFields from 'components/dumb/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import BoxMessage from 'components/dumb/Box/Message';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Redirect from 'components/dumb/Redirect';

import routes from 'routes';
import errorTypes from 'constants/errorTypes';

import { serviceClaimValidationSchema } from 'constants/validationSchemas/dpo';

// CONSTANTS
const { conflict } = errorTypes;

// @FIXME: add to @misakey/API
const ENDPOINTS = {
  claim: {
    create: {
      method: 'POST',
      path: '/user-role-claims',
      auth: true,
    },
    list: {
      method: 'GET',
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

const DEFAULT_FIELDS = {
  code: { component: FieldCode, label: undefined },
};

const INITIAL_VALUES = {
  code: '',
};

// HELPERS
const idProp = prop('id');
const mainDomainProp = prop('mainDomain');
const referrerPath = path(['state', 'referrer']);

// COMPONENTS
const ServiceRoleClaimFormFields = (fields) => (
  <FormFields fields={fields} prefix="serviceRoleClaim." defaultFields={DEFAULT_FIELDS} />
);

ServiceRoleClaimFormFields.defaultProps = DEFAULT_FIELDS;

function ServiceRoleClaim({
  appBarProps,
  location,
  service,
  t,
  userId,
  error,
  isLoading,
  dispatchUserRoles,
  userRoles,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const role = useLocationWorkspace();

  const [internalFetching, setInternalFetching] = useState(false);
  const [internalError, setInternalError] = useState();

  const [errorMessage, setErrorMessage] = useState();
  const [claim, setClaim] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isCreating, setCreating] = useState(false);

  const hasClaimId = useMemo(
    () => !isNil(idProp(claim)),
    [claim],
  );

  const mainDomain = useMemo(
    () => mainDomainProp(service),
    [service],
  );

  const dpoRequestListTo = useMemo(
    () => (isNil(mainDomain)
      ? null
      : generatePath(routes.dpo.service.requests._, { mainDomain })),
    [mainDomain],
  );

  const nextTo = useMemo(
    () => {
      const referrer = referrerPath(location);
      return isNil(referrer)
        ? dpoRequestListTo
        : referrer;
    },
    [dpoRequestListTo, location],
  );

  const fetchRoleList = useGetRoles(dispatchUserRoles);
  const { id: userRoleId, valid: userHasRole } = useMemo(
    () => {
      const invalid = { id: null, valid: false };
      if (!service) { return invalid; }

      const { id } = service;
      const userRole = userRoles.find(
        ({ applicationId, roleLabel }) => applicationId === id && roleLabel === role,
      );
      return (userRole) || invalid;
    },
    [service, userRoles, role],
  );

  const state = useMemo(
    () => ({
      error: error || internalError,
      isLoading: isLoading || internalFetching,
      preventSplashScreen: !isNil(service),
    }),
    [error, internalError, internalFetching, isLoading, service],
  );

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
          'screens:Service.role.claim.email.success',
          { mainDomain: service.mainDomain },
        );
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        if (prop('code')(e) === conflict) {
          setErrorMessage(t(`fields:serviceRoleClaim.code.error.${conflict}`));
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => setCreating(false));
  }, [service, isCreating, userId, role, t, enqueueSnackbar, handleGenericHttpErrors]);

  const handleSubmit = useCallback((values, { setErrors, setSubmitting }) => {
    if (isNil(claim) || isNil(claim.id)) { throw new Error('Cannot submit, claim is nil'); }

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
          setErrors({ code: details.value });
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => setSubmitting(false));
  }, [claim, fetchRoleList, userId, handleGenericHttpErrors]);

  const fetchClaim = useCallback(() => {
    setInternalFetching(true);

    API.use(ENDPOINTS.claim.list)
      .build(null, null, { user_role_id: userRoleId })
      .send()
      .then((response) => {
        const found = head(response);
        if (isObject(found)) {
          setClaim(objectToCamelCase(found));
        }
      })
      .catch((e) => setInternalError(e.httpStatus || 500))
      .finally(() => setInternalFetching(false));
  }, [setInternalFetching, setInternalError, setClaim, userRoleId]);

  useEffect(
    () => {
      if (!isNil(userRoleId)) {
        fetchClaim();
      }
    },
    [fetchClaim, userRoleId],
  );


  if (userHasRole) {
    enqueueSnackbar(t(
      'screens:Service.role.claim.info.alreadyDpo',
      { mainDomain: service.mainDomain, role },
    ),
    { variant: 'info' });
    return <Redirect to={dpoRequestListTo} />;
  }

  return (
    <ScreenAction
      title={t('screens:Service.role.claim.title', service)}
      state={state}
      appBarProps={appBarProps}
    >
      <Container maxWidth="md">
        <Subtitle
          align="left"
          variant="subtitle1"
          color="textSecondary"
          gutterBottom
        >
          {t('screens:Service.role.claim.subtitle', service)}
        </Subtitle>
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={serviceClaimValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isValid, isSubmitting }) => (
            <Box
              component={Form}
              mt={3}
            >
              {(service && isEmpty(service.dpoEmail)) && (
                <>
                  <BoxMessage
                    mt={1}
                    type="error"
                    text={t(
                      'screens:Service.role.claim.errors.missingDpoEmail.text',
                      { mainDomain: service.mainDomain },
                    )}
                  />
                  <Box align="right" mt={1}>
                    <Button
                      variant="contained"
                      color="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                      component="a"
                      href="mailto:question.perso@misakey.com"
                    >
                      {t('screens:Service.role.claim.errors.missingDpoEmail.button')}
                    </Button>
                  </Box>
                </>
              )}
              {(service && !isEmpty(service.dpoEmail)) && (
                <>
                  {success && (
                    <BoxMessage
                      mt={1}
                      type="success"
                      text={t('screens:Service.role.claim.success', service)}
                    />
                  )}
                  {errorMessage && (
                    <BoxMessage
                      mt={1}
                      type="error"
                      text={errorMessage}
                    />
                  )}
                  <ServiceRoleClaimFormFields />
                  <BoxControls
                    mt={2}
                    primary={success
                      ? {
                        component: Link,
                        to: nextTo,
                        text: t('common:next'),
                      }
                      : {
                        isValid: isValid && hasClaimId,
                        isLoading: isSubmitting,
                        text: t('common:submit'),
                        type: 'submit',
                      }}
                    secondary={{
                      isValid: !success || !hasClaimId,
                      isLoading: isCreating,
                      onClick: handleEmail,
                      text: t('screens:Service.role.claim.email.submit'),
                    }}
                  />
                </>
              )}
            </Box>
          )}
        </Formik>
      </Container>
    </ScreenAction>
  );
}

ServiceRoleClaim.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mainDomain: PropTypes.string.isRequired,
    dpoEmail: PropTypes.string,
  }),
  t: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  error: PropTypes.instanceOf(Error),
  isLoading: PropTypes.bool.isRequired,
  dispatchUserRoles: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }).isRequired,
};

ServiceRoleClaim.defaultProps = {
  appBarProps: null,
  service: {},
  error: null,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchUserRoles: (roles) => dispatch(loadUserRoles(roles)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens', 'fields'])(ServiceRoleClaim));
