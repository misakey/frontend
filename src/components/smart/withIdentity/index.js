import React, { useMemo, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updateIdentity } from '@misakey/react-auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from '@misakey/react-auth/store/schemas/Identity';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import identityFn from '@misakey/core/helpers/identity';
import isEmpty from '@misakey/core/helpers/isEmpty';
import { getIdentity as getIdentityBuilder } from '@misakey/core/auth/builder/identities';

// COMPONENTS
const withIdentity = (Component, mapProps = identityFn) => {
  const ComponentWithIdentity = forwardRef(({
    isAuthenticated, identity, identityId,
    onLoadIdentity,
    ...props
  }, ref) => {
    const shouldFetch = useMemo(
      () => isEmpty(identity) && !isEmpty(identityId) && isAuthenticated,
      [isAuthenticated, identity, identityId],
    );

    const getIdentity = useCallback(
      () => getIdentityBuilder(identityId),
      [identityId],
    );

    const onSuccess = useCallback(
      (user) => onLoadIdentity(user),
      [onLoadIdentity],
    );

    const { isFetching } = useFetchEffect(getIdentity, { shouldFetch }, { onSuccess });

    const mappedProps = useMemo(
      () => mapProps({
        ...props,
        isFetchingIdentity: isFetching || shouldFetch,
        isAuthenticated,
        identity,
        identityId,
      }),
      [identity, identityId, isFetching, props, shouldFetch, isAuthenticated],
    );

    return (
      <Component
        ref={ref}
        {...mappedProps}
      />
    );
  });

  ComponentWithIdentity.propTypes = {
    isAuthenticated: PropTypes.bool,
    identity: PropTypes.shape(IdentitySchema.propTypes),
    identityId: PropTypes.string,
    onLoadIdentity: PropTypes.func.isRequired,
  };

  ComponentWithIdentity.defaultProps = {
    isAuthenticated: false,
    identity: null,
    identityId: null,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    identity: state.auth.identity,
    identityId: state.auth.identityId,
  });

  const mapDispatchToProps = (dispatch) => ({
    onLoadIdentity: (identity) => {
      const normalized = normalize(identity, IdentitySchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(updateIdentity(identity)),
        dispatch(receiveEntities(entities)),
      ]);
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { forwardRef: true },
  )(ComponentWithIdentity);
};


export default withIdentity;
