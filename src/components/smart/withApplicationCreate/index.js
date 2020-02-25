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

import API from '@misakey/api';

import errorTypes from '@misakey/ui/constants/errorTypes';

import { MAIN_DOMAIN_REGEX } from 'constants/validationSchemas/information';
import { WORKSPACE } from 'constants/workspaces';

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

// HELPERS
const getMainDomainError = prop('main_domain');

const createApplication = (form) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase(form))
  .send();

// COMPONENTS
const withApplicationsCreate = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const handleGenericHttpErrors = useHandleGenericHttpErrors();
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();
    const { dispatchApplicationCreate, ...rest } = props;

    const workspace = useLocationWorkspace();
    const redirectRoute = useMemo(
      () => ((workspace === WORKSPACE.DPO)
        ? routes.dpo.service.claim._
        : routes.citizen.application.vault),
      [workspace],
    );

    const redirectOnSuccess = useCallback((application) => {
      const { mainDomain } = application;
      history.push(generatePath(redirectRoute, { mainDomain }));
    }, [history, redirectRoute]);

    const onCreateApplication = useCallback(
      ({ mainDomain }, { setSubmitting, setFieldError }, successText) => {
        const matchedRegex = MAIN_DOMAIN_REGEX.exec(mainDomain);
        const form = { mainDomain: matchedRegex[1] };
        return createApplication(form)
          .then((response) => {
            const application = objectToCamelCase(response);
            if (!isNil(successText)) {
              enqueueSnackbar(successText, { variant: 'success' });
            }
            dispatchApplicationCreate(application);
            redirectOnSuccess(application);
          })
          .catch((error) => {
            const { httpStatus, code, details } = error;
            if (httpStatus === 409) {
              redirectOnSuccess(form);
            } else {
              const mainDomainError = getMainDomainError(details);
              if (code === badRequest && !isNil(mainDomainError)) {
                setFieldError(MAIN_DOMAIN_FIELD_NAME, mainDomainError);
              } else {
                handleGenericHttpErrors(error);
              }
            }
          })
          .finally(() => { setSubmitting(false); });
      },
      [dispatchApplicationCreate, enqueueSnackbar, handleGenericHttpErrors, redirectOnSuccess],
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
    dispatchApplicationCreate: PropTypes.func.isRequired,
  };

  // CONNECT
  const mapDispatchToProps = (dispatch) => ({
    dispatchApplicationCreate: (application) => {
      const normalized = normalize(application, ApplicationSchema.entity);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
  });

  return connect(null, mapDispatchToProps)(Wrapper);
};

export default withApplicationsCreate;
