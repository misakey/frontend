import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { signIn } from '@misakey/auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from 'store/schemas/Identity';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';
import { getIdentity as getIdentityBuilder } from '@misakey/auth/builder/identities';

// HELPERS
const isAnyEmpty = any(isEmpty);

// COMPONENTS
const withIdentity = (Component) => {
  const ComponentWithIdentity = ({ id, token, identity, identityId, onSignIn, ...props }) => {
    const shouldFetch = useMemo(
      () => isAnyEmpty([token, identity]) && !isEmpty(identityId),
      [token, identity, identityId],
    );

    const getIdentity = useCallback(
      () => getIdentityBuilder(identityId),
      [identityId],
    );

    const onSuccess = useCallback(
      (user) => onSignIn(user),
      [onSignIn],
    );

    const { isFetching } = useFetchEffect(getIdentity, { shouldFetch }, { onSuccess });

    return (
      <Component
        {...props}
        isFetching={isFetching}
        id={id}
        token={token}
        identity={identity}
        identityId={identityId}
      />
    );
  };

  ComponentWithIdentity.propTypes = {
    id: PropTypes.string,
    token: PropTypes.string,
    identity: PropTypes.shape(IdentitySchema.propTypes),
    identityId: PropTypes.string,
    onSignIn: PropTypes.func.isRequired,
  };

  ComponentWithIdentity.defaultProps = {
    id: null,
    token: null,
    identity: null,
    identityId: null,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    id: state.auth.id,
    token: state.auth.token,
    identity: state.auth.identity,
    identityId: state.auth.identityId,
  });

  const mapDispatchToProps = (dispatch) => ({
    onSignIn: (identity) => {
      const normalized = normalize(identity, IdentitySchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(signIn({ identity })),
        dispatch(receiveEntities(entities)),
      ]);
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentWithIdentity);
};


export default withIdentity;