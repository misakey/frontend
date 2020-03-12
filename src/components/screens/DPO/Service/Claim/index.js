import React, { useMemo, useCallback, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { connect } from 'react-redux';

import API from '@misakey/api';

import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import BoxControls from 'components/dumb/Box/Controls';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import FormFields from '@misakey/ui/Form/Fields';
import FieldCode from 'components/dumb/Form/Field/Code';
import BoxMessage from '@misakey/ui/Box/Message';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Redirect from 'components/dumb/Redirect';
import CardSimpleText from 'components/dumb/Card/Simple/Text';

import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { serviceClaimValidationSchema } from 'constants/validationSchemas/dpo';
import { addRoleToUser } from 'packages/auth/src/store/actions/auth';

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
  code: { component: FieldCode, label: undefined, autoFocus: true },
};

const INITIAL_VALUES = {
  code: '',
};

const NOT_SENT_ERROR = 'notSent';

// HELPERS
const mainDomainProp = prop('mainDomain');

// COMPONENTS
const ServiceRoleClaimFormFields = (fields) => (
  <FormFields fields={fields} prefix="serviceRoleClaim." defaultFields={DEFAULT_FIELDS} />
);

ServiceRoleClaimFormFields.defaultProps = DEFAULT_FIELDS;

function ServiceRoleClaim({
  appBarProps,
  service,
  t,
  userId,
  error,
  isLoading,
  dispatchAddRoleToUser,
  userRoles,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const role = useLocationWorkspace();

  const [claim, setClaim] = useState(null);
  const [isCreating, setCreating] = useState(false);

  const hasDpoEmail = useMemo(
    () => service && !isEmpty(service.dpoEmail),
    [service],
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

  const shouldFetchClaim = useMemo(
    () => !isNil(userRoleId),
    [userRoleId],
  );

  const handleEmail = useCallback(() => {
    setCreating(true);

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
          'dpo:services.claim.email.success',
          { mainDomain: service.mainDomain },
        );
        enqueueSnackbar(text, { variant: 'success' });
      })
      .catch((e) => {
        if (prop('code')(e) === conflict) {
          enqueueSnackbar(t('fields:serviceRoleClaim.code.error.conflict'), { variant: 'error' });
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => setCreating(false));
  }, [userId, service, role, t, enqueueSnackbar, handleGenericHttpErrors]);

  const handleSubmit = useCallback((values, { setErrors, setSubmitting }) => {
    if (isNil(claim) || isNil(claim.id)) {
      setErrors({ code: NOT_SENT_ERROR });
      setSubmitting(false);
      return;
    }

    const query = { id: claim.id };
    const payload = { validated_at: moment.utc(Date.now()).format(), value: values.code.join('') };

    API.use(ENDPOINTS.claim.confirm.update)
      .build(query, payload)
      .send()
      .then((response) => {
        const { userRole } = objectToCamelCase(response);
        enqueueSnackbar(t('dpo:services.claim.success', service), { variant: 'success' });
        dispatchAddRoleToUser(objectToCamelCase(userRole));
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
  }, [claim, enqueueSnackbar, t, service, dispatchAddRoleToUser, handleGenericHttpErrors]);

  const fetchClaim = useCallback(
    () => API.use(ENDPOINTS.claim.list)
      .build(null, null, { user_role_id: userRoleId })
      .send(),
    [userRoleId],
  );

  const onFetchClaimSuccess = useCallback(
    (response) => {
      const found = head(response);
      if (isObject(found)) {
        setClaim(objectToCamelCase(found));
      }
    },
    [setClaim],
  );

  const { isFetching: internalFetching } = useFetchEffect(
    fetchClaim,
    { shouldFetch: shouldFetchClaim },
    { onSuccess: onFetchClaimSuccess },
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isLoading || internalFetching,
      preventSplashScreen: !isNil(service),
    }),
    [error, internalFetching, isLoading, service],
  );

  if (userHasRole) { return <Redirect to={dpoRequestListTo} />; }

  return (
    <ScreenAction
      title={t('dpo:services.claim.title')}
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
          {t('dpo:services.claim.subtitle', service)}
        </Subtitle>
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={serviceClaimValidationSchema}
          onSubmit={handleSubmit}
        >
          <Box
            component={Form}
            mt={3}
          >
            {!hasDpoEmail && (
              <>
                <BoxMessage
                  my={1}
                  type="info"
                  text={t(
                    'dpo:services.claim.errors.missingDpoEmail.description',
                    { mainDomain },
                  )}
                />
                <CardSimpleText
                  text={t(
                    'dpo:services.claim.errors.missingDpoEmail.text',
                    { mainDomain },
                  )}
                  button={{
                    standing: BUTTON_STANDINGS.MAIN,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    component: 'a',
                    text: t('dpo:services.claim.errors.missingDpoEmail.button'),
                    href: 'mailto:question.pro@misakey.com',
                  }}
                />
              </>
            )}
            {hasDpoEmail && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box display="flex" flexDirection="column">
                <ServiceRoleClaimFormFields />
                <Box display="flex">
                  <Button
                    standing={BUTTON_STANDINGS.TEXT}
                    disabled={isNil(service)}
                    isLoading={isCreating}
                    onClick={handleEmail}
                    text={t('dpo:services.claim.email.submit')}
                  />
                </Box>
              </Box>

              <BoxControls
                mt={2}
                primary={{
                  text: t('common:next'),
                  type: 'submit',
                }}
                formik
              />
            </Box>
            )}
          </Box>
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
  isLoading: PropTypes.bool,
  dispatchAddRoleToUser: PropTypes.func.isRequired,
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
  isLoading: false,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchAddRoleToUser: (role) => dispatch(addRoleToUser(role)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'dpo', 'fields'])(ServiceRoleClaim));
