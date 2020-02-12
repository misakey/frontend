import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, generatePath } from 'react-router-dom';

import { ROLE_LABELS, ROLE_PREFIX_SCOPE } from 'constants/Roles';
import API from '@misakey/api';
import routes from 'routes';

import ApplicationSchema from 'store/schemas/Application';
import { onReceiveProducer } from 'store/actions/access';
import { denormalize } from 'normalizr';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';

import withAccessRequest from 'components/smart/withAccessRequest';
import AccessRequestError from 'components/smart/Route/AccessRequest/Error';
import useUserHasRole from '@misakey/hooks/useUserHasRole';

import SplashScreen from 'components/dumb/Screen/Splash';

import Choose from './Choose';

// CONSTANTS
const APP_INFO_READ_ENDPOINT = {
  method: 'GET',
  path: '/application-info/:id',
};

// HELPERS
const getApplication = (id, isAuthenticated) => {
  const endpoint = {
    ...APP_INFO_READ_ENDPOINT,
    auth: isAuthenticated,
  };
  return API
    .use(endpoint)
    .build({ id })
    .send();
};

const producerIdProp = prop('producerId');
const producerMainDomainProp = prop('mainDomain');
const databoxIdProp = prop('databoxId');


// COMPONENTS
function RouteAccessRequest({
  component: Component, componentProps,
  ...rest
}) {
  // User is not a [CONFIRMED_VISITOR] and is not Authenticated
  // or user is Authenticated and doesn't have the right role for the page
  // then return the RouteAccessRequest
  // else everything is right

  const Render = ({
    location, match, history,
    accessRequest,
    isAuthenticated, userRoles, producer,
    dispatchOnReceiveProducer,
    isFetching,
    error,
    ...props
  }) => {
    const [internalFetching, setInternalFetching] = useState(false);
    const [internalError, setInternalError] = useState();

    const renderProps = {
      history,
      location,
      match,
      accessRequest,
      producer,
      isFetching: isFetching || internalFetching,
      error: error || internalError,
      ...props,
      ...componentProps,
    };

    const producerId = useMemo(
      () => producerIdProp(accessRequest),
      [accessRequest],
    );

    const mainDomain = useMemo(
      () => producerMainDomainProp(producer),
      [producer],
    );

    const requiredScope = useMemo(
      () => `${ROLE_PREFIX_SCOPE}.${ROLE_LABELS.DPO}.${producerId}`,
      [producerId],
    );

    const requestReadTo = useMemo(
      () => (isNil(mainDomain)
        ? null
        : generatePath(routes.dpo.service.requests.read, {
          mainDomain,
          databoxId: databoxIdProp(accessRequest),
        })),
      [mainDomain, accessRequest],
    );

    const userHasRole = useUserHasRole(userRoles, requiredScope);

    const claimRedirectTo = useMemo(
      () => (isNil(mainDomain)
        ? null
        : {
          pathname: generatePath(routes.dpo.service.claim._, { mainDomain }),
          state: { referrer: requestReadTo },
        }),
      [mainDomain, requestReadTo],
    );

    const redirectToClaim = useCallback(
      () => { history.replace(claimRedirectTo); },
      [claimRedirectTo, history],
    );

    const shouldFetchApplication = useMemo(
      () => isNil(producer) && !isNil(producerId) && !internalFetching && !internalError,
      [producer, producerId, internalFetching, internalError],
    );

    const fetchApplication = useCallback(
      () => {
        setInternalFetching(true);
        getApplication(producerId, isAuthenticated)
          .then((response) => dispatchOnReceiveProducer(objectToCamelCase(response)))
          .catch((e) => { setInternalError(e); })
          .finally(() => { setInternalFetching(false); });
      },
      [
        dispatchOnReceiveProducer,
        isAuthenticated,
        producerId,
        setInternalFetching,
        setInternalError,
      ],
    );

    useEffect(
      () => {
        if (shouldFetchApplication) {
          fetchApplication();
        }
      },
      [shouldFetchApplication, fetchApplication],
    );

    useEffect(
      () => {
        if (!isNil(claimRedirectTo) && (isAuthenticated && !isNil(userRoles) && !userHasRole)) {
          redirectToClaim();
        }
      },
      [claimRedirectTo, isAuthenticated, redirectToClaim, userHasRole, userRoles],
    );

    if (error) {
      return <AccessRequestError error={error} />;
    }

    if (isFetching || internalFetching || isNil(requestReadTo)) {
      return <SplashScreen />;
    }

    if (isAuthenticated && userHasRole) {
      return <Redirect to={requestReadTo} />;
    }

    return <Choose producer={producer} {...renderProps} />;
  };

  Render.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mainDomain: PropTypes.string,
        databoxId: PropTypes.string,
      }),
    }).isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }).isRequired,
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
    // withAccessRequest
    accessRequest: PropTypes.shape({
      producerId: PropTypes.string,
      databoxId: PropTypes.string,
    }),
    isAuthenticated: PropTypes.bool,
    userRoles: PropTypes.arrayOf(PropTypes.shape({
      roleLabel: PropTypes.string,
      applicationId: PropTypes.string,
    })),
    producer: PropTypes.shape(ApplicationSchema.propTypes),
    // CONNECT dispatch
    dispatchOnReceiveProducer: PropTypes.func.isRequired,
  };

  Render.defaultProps = {
    producer: null,
    accessRequest: {},
    isAuthenticated: false,
    userRoles: null,
    error: null,
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const { producerKey } = state.access;

    return {
      producer: isNil(producerKey)
        ? null
        : denormalize(
          producerKey,
          ApplicationSchema.entity,
          state.entities,
        ),
      isAuthenticated: !!state.auth.token,
      userRoles: state.auth.roles,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatchOnReceiveProducer: (data) => dispatch(onReceiveProducer(data)),
  });

  const component = connect(mapStateToProps, mapDispatchToProps)(
    withAccessRequest(Render),
  );

  return <Route {...rest} component={component} />;
}

RouteAccessRequest.propTypes = {
  component: PropTypes.elementType.isRequired,
  componentProps: PropTypes.objectOf(PropTypes.any),
};

RouteAccessRequest.defaultProps = {
  componentProps: {},
};

export default RouteAccessRequest;
