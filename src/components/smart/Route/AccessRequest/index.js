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
import useUserHasRole from 'hooks/useUserHasRole';

import { makeStyles } from '@material-ui/core/styles';
import SplashScreen from 'components/dumb/SplashScreen';
import ApplicationAvatar from 'components/dumb/Avatar/Application';

import Fallback from './Fallback';
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

const hasNoAuth = (location) => {
  const { search } = location;
  const searchParams = new URLSearchParams(search);
  return searchParams.has('noAuth');
};

// HOOKS
const useStyles = makeStyles(() => ({
  avatarParent: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

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
    isAuthenticated, isConfirmed, userRoles, producer,
    dispatchOnReceiveProducer,
    isFetching,
    error,
    ...props
  }) => {
    const classes = useStyles();
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

    const appBarProps = useMemo(
      () => ({
        withUser: false,
        withSearchBar: false,
        items: [(
          // @FIXME Make a dumb component of it
          <div className={classes.avatarParent} key="applicationAvatarParent">
            <ApplicationAvatar application={producer} />
          </div>
        )],
      }),
      [classes.avatarParent, producer],
    );

    const noAuth = useMemo(
      () => hasNoAuth(location),
      [location],
    );

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

    if (isFetching || internalFetching || isNil(requestReadTo)) {
      return <SplashScreen />;
    }

    if (isAuthenticated && userHasRole) {
      return <Redirect to={requestReadTo} />;
    }

    if (isConfirmed) {
      return (
        <Component
          appBarProps={appBarProps}
          isAuthenticated={isAuthenticated}
          {...renderProps}
        />
      );
    }

    if (!isAuthenticated && !noAuth) {
      return <Choose producer={producer} {...renderProps} />;
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
    isFetching: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
    // withAccessRequest
    accessRequest: PropTypes.shape({
      producerId: PropTypes.string,
      databoxId: PropTypes.string,
    }),
    // CONNECT state
    accessToken: PropTypes.shape({
      token: PropTypes.string,
      createdAt: PropTypes.string,
      expiresAt: PropTypes.string,
      subject: PropTypes.string,
      scope: PropTypes.string,
    }),
    isAuthenticated: PropTypes.bool,
    isConfirmed: PropTypes.bool,
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
    accessToken: {},
    accessRequest: {},
    isAuthenticated: false,
    isConfirmed: false,
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
      accessToken: state.access.token,
      isConfirmed: !!state.access.token.token,
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
