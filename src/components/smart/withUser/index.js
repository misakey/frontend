import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import API from '@misakey/api';

import { signIn } from '@misakey/auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import UserSchema from 'store/schemas/User';

import useAsync from '@misakey/hooks/useAsync';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import any from '@misakey/helpers/any';
import isEmpty from '@misakey/helpers/isEmpty';

// HELPERS
const isAnyEmpty = any(isEmpty);

const fetchUser = (userId) => API
  .use(API.endpoints.user.read)
  .build({ id: userId })
  .send();

// HOOKS
const useGetUser = (userId, shouldFetch, onSignIn, setFetching, setError) => useCallback(
  () => {
    if (userId && shouldFetch) {
      setFetching(true);

      fetchUser(userId)
        .then((response) => {
          onSignIn(objectToCamelCase(response));
        })
        .catch((e) => { setError(e.status); })
        .finally(() => { setFetching(false); });
    }
  }, [userId, shouldFetch, onSignIn, setFetching, setError],
);

// COMPONENTS
const withUser = (Component) => {
  const ComponentWithUser = ({ id, token, profile, userId, onSignIn, ...props }) => {
    const [isFetching, setFetching] = useState(false);
    const [error, setError] = useState();

    const shouldFetch = useMemo(
      () => isAnyEmpty([userId, token, profile]),
      [userId, token, profile],
    );

    const getUser = useGetUser(userId, shouldFetch, onSignIn, setFetching, setError);

    useAsync(getUser, shouldFetch);

    return (
      <Component
        {...props}
        isFetching={isFetching}
        error={error}
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
