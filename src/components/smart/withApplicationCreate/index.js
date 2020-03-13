import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { generatePath, useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { normalize } from 'normalizr';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import prop from '@misakey/helpers/prop';

import { addToUserApplications } from 'store/actions/applications/userApplications';


import API from '@misakey/api';
import { fetchApplicationByMainDomain } from '@misakey/helpers/fetchApplications';


import errorTypes from '@misakey/ui/constants/errorTypes';

import { WORKSPACE } from 'constants/workspaces';
import { mainDomainFieldValidation } from 'constants/fieldValidations';

import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

// CONSTANTS
const { badRequest } = errorTypes;
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';

const APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-info',
  auth: true,
};

const APPLICATION_CONTRIBUTION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

const USER_APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/user-applications',
  auth: true,
};

const CHAIN_BREAKER_ERROR = new Error('Block next calls');
CHAIN_BREAKER_ERROR.isAlreadyTreated = true;


// HELPERS
const getMainDomainError = prop('main_domain');

const createApplication = (
  form, dispatchApplicationCreate, mainDomain, setFieldError, handleGenericHttpErrors,
) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase(form))
  .send()
  .then((response) => {
    const application = objectToCamelCase(response);
    dispatchApplicationCreate(application);
    return application;
  })
  .catch((error) => {
    const { httpStatus, code, details } = error;
    if (httpStatus === 409) {
      return fetchApplicationByMainDomain(mainDomain);
    }
    const mainDomainError = getMainDomainError(details);
    if (code === badRequest && !isNil(mainDomainError)) {
      setFieldError(MAIN_DOMAIN_FIELD_NAME, mainDomainError);
    } else {
      handleGenericHttpErrors(error);
    }
    throw CHAIN_BREAKER_ERROR;
  });

const createApplicationContribution = (applicationId, userId, mainDomain, dpoEmail) => API
  .use(APPLICATION_CONTRIBUTION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase({ applicationId, userId, dpoEmail, mainDomain }))
  .send();

const createUserApplication = (applicationId, userId) => API
  .use(USER_APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase({ applicationId, userId }))
  .send()
  .catch((error) => {
    const { httpStatus } = error;
    if (httpStatus === 409) {
      return null;
    }
    throw error;
  });

// COMPONENTS
const withApplicationsCreate = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const handleGenericHttpErrors = useHandleGenericHttpErrors();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();
    const { dispatchApplicationCreate, dispatchAddToUserApplications, userId, ...rest } = props;

    const workspace = useLocationWorkspace();
    const redirectRoute = useMemo(
      () => ((workspace === WORKSPACE.DPO)
        ? routes.dpo.service.claim._
        : routes.citizen.application.vault),
      [workspace],
    );

    const redirectOnSuccess = useCallback((createApplicationFormValues) => {
      const { mainDomain } = createApplicationFormValues;
      history.push(generatePath(redirectRoute, { mainDomain }));
    }, [history, redirectRoute]);

    const onCreateApplication = useCallback(
      (
        { mainDomain: homepage, dpoEmail },
        { setSubmitting, setFieldError },
        successText,
      ) => {
        const matchedRegex = mainDomainFieldValidation.regex.exec(homepage);
        const mainDomain = matchedRegex[1];
        const form = { mainDomain };

        return createApplication(
          form, dispatchApplicationCreate, mainDomain, setFieldError, handleGenericHttpErrors,
        ).then((application) => createApplicationContribution(
          application.id, userId, mainDomain, dpoEmail,
        ).then(() => application))
          .then((application) => {
            if (workspace === WORKSPACE.CITIZEN) {
              createUserApplication(application.id, userId);
              dispatchAddToUserApplications(WORKSPACE.CITIZEN, mainDomain);
            }
          })
          .then(() => {
            if (!isNil(successText)) {
              enqueueSnackbar(successText, { variant: 'success' });
            }
            redirectOnSuccess(form);
          })
          .catch((error) => {
            if (error.isAlreadyTreated !== true) {
              throw error;
            }
          })
          .finally(() => { setSubmitting(false); });
      },
      [
        dispatchApplicationCreate, dispatchAddToUserApplications, enqueueSnackbar,
        redirectOnSuccess, userId, workspace, handleGenericHttpErrors,
      ],
    );

    const mappedProps = useMemo(
      () => mapper({
        onCreateApplication,
        ...rest,
      }),
      [onCreateApplication, rest],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    userId: PropTypes.string.isRequired,
    dispatchApplicationCreate: PropTypes.func.isRequired,
    dispatchAddToUserApplications: PropTypes.func.isRequired,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    userId: state.auth.userId,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchApplicationCreate: (application) => {
      const normalized = normalize(application, ApplicationSchema.entity);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
    dispatchAddToUserApplications: (workspace, mainDomain) => dispatch(
      addToUserApplications(workspace, mainDomain),
    ),
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withApplicationsCreate;
