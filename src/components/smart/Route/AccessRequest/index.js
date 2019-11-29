import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, generatePath } from 'react-router-dom';

import { ROLE_LABELS } from 'constants/Roles';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';

import withAccessRequest from 'components/smart/withAccessRequest';
import useUserHasRole from 'hooks/useUserHasRole';
import Fallback from './Fallback';
import Choose from './Choose';

// HELPERS
const producerMainDomainProp = prop('producerMainDomain');
const producerIdProp = prop('producerId');
const databoxIdProp = prop('databoxId');

const hasNoAuth = (location) => {
  const { search } = location;
  const searchParams = new URLSearchParams(search);
  return searchParams.has('noAuth');
};

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
    isAuthenticated, isConfirmed, userRoles,
    isFetching,
    error,
    ...props
  }) => {
    const renderProps = {
      accessRequest,
      location,
      match,
      isFetching,
      error,
      ...props,
      ...componentProps,
    };

    const noAuth = useMemo(
      () => hasNoAuth(location),
      [location],
    );

    const mainDomain = useMemo(
      () => producerMainDomainProp(accessRequest),
      [accessRequest],
    );

    const requiredScope = useMemo(
      () => `rol.${ROLE_LABELS.DPO}.${producerIdProp(accessRequest)}`,
      [accessRequest],
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

    useEffect(
      () => {
        if (!isNil(claimRedirectTo) && (isAuthenticated && !isNil(userRoles) && !userHasRole)) {
          redirectToClaim();
        }
      },
      [claimRedirectTo, isAuthenticated, redirectToClaim, userHasRole, userRoles],
    );

    if (isAuthenticated && userHasRole) {
      return <Redirect to={requestReadTo} />;
    }

    if (isConfirmed) {
      return <Component isAuthenticated={isAuthenticated} {...renderProps} />;
    }

    if (!isAuthenticated && !noAuth) {
      return <Choose {...renderProps} />;
    }

    return <Fallback isAuthenticated={isAuthenticated} {...renderProps} />;
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
    accessToken: PropTypes.shape({
      token: PropTypes.string,
      createdAt: PropTypes.string,
      expiresAt: PropTypes.string,
      subject: PropTypes.string,
      scope: PropTypes.string,
    }),
    accessRequest: PropTypes.shape({
      producerMainDomain: PropTypes.string,
      producerId: PropTypes.string,
      databoxId: PropTypes.string,
    }),
    isAuthenticated: PropTypes.bool,
    isConfirmed: PropTypes.bool,
    userRoles: PropTypes.arrayOf(PropTypes.shape({
      roleLabel: PropTypes.string,
      applicationId: PropTypes.string,
    })),
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
  };

  Render.defaultProps = {
    accessToken: {},
    accessRequest: {},
    isAuthenticated: false,
    isConfirmed: false,
    userRoles: null,
    error: null,
  };


  // CONNECT
  const mapStateToProps = (state) => ({
    accessToken: state.accessToken,
    isConfirmed: !!state.accessToken.token,
    isAuthenticated: !!state.auth.token,
    userRoles: state.auth.roles,
  });


  const component = connect(mapStateToProps, {})(
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
