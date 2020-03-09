import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import API from '@misakey/api';

import { normalize, denormalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import UserEmailByUserIdSchema from 'store/schemas/UserEmail/ByUserId';
import UserEmailSchema from 'store/schemas/UserEmail';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';

// CONSTANTS
const LIST_USER_EMAILS = {
  method: 'GET',
  path: '/user-emails',
  auth: true,
};

// HELPERS
const userEmailsProp = prop('userEmails');

const fetchUserEmails = (userId) => API
  .use(LIST_USER_EMAILS)
  .build(null, null, objectToSnakeCase({ userId }))
  .send();

// COMPONENTS
const withUserEmails = (Component) => {
  const ComponentWithUserEmails = ({ userId, userEmails, dispatchReceive, ...props }) => {
    const shouldFetch = useMemo(
      () => isNil(userEmails) && !isEmpty(userId),
      [userEmails, userId],
    );

    const getUserEmails = useCallback(
      () => fetchUserEmails(userId),
      [userId],
    );

    const onSuccess = useCallback(
      (response) => dispatchReceive(response.map(objectToCamelCase), userId),
      [dispatchReceive, userId],
    );

    const { isFetching } = useFetchEffect(getUserEmails, { shouldFetch }, { onSuccess });

    return (
      <Component
        {...props}
        isFetchingUserEmails={isFetching}
        userEmails={userEmails}
        userId={userId}
      />
    );
  };

  ComponentWithUserEmails.propTypes = {
    // CONNECT
    userId: PropTypes.string,
    userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
    dispatchReceive: PropTypes.func.isRequired,
  };

  ComponentWithUserEmails.defaultProps = {
    userId: null,
    userEmails: null,
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const { userId } = state.auth;
    const userEmailByUserId = denormalize(
      userId,
      UserEmailByUserIdSchema.entity,
      state.entities,
    );
    const userEmails = userEmailsProp(userEmailByUserId);
    return {
      userEmails,
      userId,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceive: (userEmails, userId) => {
      const normalized = normalize(
        { userEmails, userId },
        UserEmailByUserIdSchema.entity,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ComponentWithUserEmails);
};


export default withUserEmails;
