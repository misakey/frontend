import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import API from '@misakey/api';

import { signIn } from '@misakey/auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import UserSchema from 'store/schemas/User';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';

// HELPERS
const isAnyEmpty = any(isEmpty);

const fetchUser = (userId) => API
  .use(API.endpoints.user.read)
  .build({ id: userId })
  .send();

// COMPONENTS
const withUser = (Component) => {
  const ComponentWithUser = ({ id, token, profile, userId, onSignIn, ...props }) => {
    const shouldFetch = useMemo(
      () => isAnyEmpty([token, profile]) && !isEmpty(userId),
      [token, profile, userId],
    );

    const getUser = useCallback(
      () => fetchUser(userId),
      [userId],
    );

    const onSuccess = useCallback(
      (response) => onSignIn(objectToCamelCase(response)),
      [onSignIn],
    );

    const { isFetching } = useFetchEffect(getUser, { shouldFetch }, { onSuccess });

    return (
      <Component
        {...props}
        isFetching={isFetching}
        id={id}
        token={token}
        profile={profile}
        userId={userId}
      />
    );
  };

  ComponentWithUser.propTypes = {
    id: PropTypes.string,
    token: PropTypes.string,
    profile: PropTypes.shape({
      avatarUri: PropTypes.string,
      displayName: PropTypes.string,
      email: PropTypes.string,
    }),
    userId: PropTypes.string,
    onSignIn: PropTypes.func.isRequired,
  };

  ComponentWithUser.defaultProps = {
    id: null,
    token: null,
    profile: null,
    userId: null,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    id: state.auth.id,
    token: state.auth.token,
    profile: state.auth.profile,
    userId: state.auth.userId,
  });

  const mapDispatchToProps = (dispatch) => ({
    onSignIn: (profile) => {
      const normalized = normalize(profile, UserSchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(signIn({ profile })),
        dispatch(receiveEntities(entities)),
      ]);
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentWithUser);
};


export default withUser;
