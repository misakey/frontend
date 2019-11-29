import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import API from '@misakey/api';

import ApplicationSchema from 'store/schemas/Application';

import useAsync from '@misakey/hooks/useAsync';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import ScreenError from 'components/dumb/Screen/Error';

// CONSTANTS
// @FIXME add endpoint to js-common
const RATINGS_ENDPOINT = {
  method: 'GET',
  path: '/ratings',
};

export const PROP_TYPES = {
  // eslint-disable-next-line react/forbid-foreign-prop-types
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,

  isAuthenticated: PropTypes.bool,
  userId: PropTypes.string,
};

export const DEFAULT_PROPS = {
  isAuthenticated: false,
  userId: null,
};

// HELPERS
const fetchMyFeedback = (applicationId, userId) => API
  .use(RATINGS_ENDPOINT)
  .build(null, null, objectToSnakeCase({ applicationId, userId }))
  .send();

// HOOKS
const useShouldFetch = (isAuthenticated, userId) => useMemo(
  () => isAuthenticated && !isNil(userId),
  [isAuthenticated, userId],
);

const useGetMyFeedback = (id, userId, shouldFetch, setError) => useCallback(
  () => {
    if (shouldFetch) {
      return fetchMyFeedback(id, userId)
        .then(
          (response) => {
            const data = response.map(objectToCamelCase);
            return head(data);
          },
          ({ httpStatus }) => {
            setError(httpStatus);
          },
        );
    }
    return Promise.resolve();
  },
  [id, userId, shouldFetch, setError],
);

// COMPONENTS
const withMyFeedback = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const [error, setError] = useState();

    const { application: { id }, isAuthenticated, userId } = props;
    const shouldFetch = useShouldFetch(isAuthenticated, userId);
    const getMyFeedback = useGetMyFeedback(id, userId, shouldFetch, setError);

    const rating = useAsync(getMyFeedback, id, userId);

    const mappedProps = useMemo(
      () => mapper({ ...props, rating }),
      [props, rating],
    );

    if (error) {
      return <ScreenError httpStatus={error} />;
    }

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = PROP_TYPES;

  Wrapper.defaultProps = DEFAULT_PROPS;

  // CONNECT
  const mapStateToProps = (state) => {
    const { userId, token } = state.auth;
    return {
      isAuthenticated: !!token,
      userId,
    };
  };

  return connect(mapStateToProps, {})(Wrapper);
};

export default withMyFeedback;
