import { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { loadUser } from '@misakey/auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from 'store/schemas/Identity';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import identityFn from '@misakey/helpers/identity';
import isEmpty from '@misakey/helpers/isEmpty';
import { getIdentity as getIdentityBuilder } from '@misakey/auth/builder/identities';

// COMPONENTS
const withIdentity = (Component, mapProps = identityFn) => {
  const ComponentWithIdentity = forwardRef(({
    id, isAuthenticated, identity, identityId,
    onLoadUser,
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
      (user) => onLoadUser(user),
      [onLoadUser],
    );

    const { isFetching } = useFetchEffect(getIdentity, { shouldFetch }, { onSuccess });

    const mappedProps = useMemo(
      () => mapProps({
        ...props,
        isFetchingIdentity: isFetching || shouldFetch,
        id,
        isAuthenticated,
        identity,
        identityId,
      }),
      [id, identity, identityId, isFetching, props, shouldFetch, isAuthenticated],
    );

    return (
      <Component
        ref={ref}
        {...mappedProps}
      />
    );
  });

  ComponentWithIdentity.propTypes = {
    id: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    identity: PropTypes.shape(IdentitySchema.propTypes),
    identityId: PropTypes.string,
    onLoadUser: PropTypes.func.isRequired,
  };

  ComponentWithIdentity.defaultProps = {
    id: null,
    isAuthenticated: false,
    identity: null,
    identityId: null,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    id: state.auth.id,
    isAuthenticated: state.auth.isAuthenticated,
    identity: state.auth.identity,
    identityId: state.auth.identityId,
  });

  const mapDispatchToProps = (dispatch) => ({
    onLoadUser: (identity) => {
      const normalized = normalize(identity, IdentitySchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(loadUser({ identity })),
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
