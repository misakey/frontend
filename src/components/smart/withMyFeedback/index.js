import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import API from '@misakey/api';

import ApplicationSchema from 'store/schemas/Application';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import ScreenError from 'components/dumb/Screen/Error';

// CONSTANTS
// @FIXME add endpoint to js-common
const ENDPOINTS = {
  ratings: {
    read: {
      method: 'GET',
      path: '/ratings',
    },
    delete: {
      method: 'DELETE',
      path: '/ratings/:id',
      auth: true,
    },
  },
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
  .use(ENDPOINTS.ratings.read)
  .build(null, null, objectToSnakeCase({ applicationId, userId }))
  .send();

// HOOKS
const useShouldFetch = (isAuthenticated, userId, id, rating) => useMemo(
  () => isAuthenticated && !isNil(userId) && !isNil(id) && isNil(rating),
  [isAuthenticated, userId, id, rating],
);

const useGetMyFeedback = (
  id, userId, shouldFetch, setError, setIsFetching, setRating,
) => useCallback(
  () => {
    if (shouldFetch) {
      setIsFetching(true);
      return fetchMyFeedback(id, userId)
        .then(
          (response) => {
            const data = response.map(objectToCamelCase);
            setRating(head(data));
          },
        )
        .catch(({ httpStatus }) => { setError(httpStatus); })
        .finally(() => { setIsFetching(false); });
    }
    return Promise.resolve();
  },
  [shouldFetch, setIsFetching, id, userId, setError, setRating],
);

const useDeleteMyFeedback = (rating, setError, setRating) => useCallback(
  () => {
    const { id } = rating;
    if (!isNil(id)) {
      return API.use(ENDPOINTS.ratings.delete)
        .build({ id })
        .send()
        .then(() => {
          setRating(null);
        })
        .catch(({ httpStatus }) => { setError(httpStatus); });
    }
    return Promise.resolve();
  },
  [rating, setError, setRating],
);

// COMPONENTS
const withMyFeedback = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const [error, setError] = useState();
    const [isFetching, setIsFetching] = useState();
    const [rating, setRating] = useState(null);

    const { application: { id }, isAuthenticated, userId } = props;
    const shouldFetch = useShouldFetch(isAuthenticated, userId, id, rating);
    const getMyFeedback = useGetMyFeedback(
      id, userId, shouldFetch, setError, setIsFetching, setRating,
    );

    useEffect(
      () => {
        if (shouldFetch) {
          getMyFeedback();
        }
      },
      [shouldFetch, getMyFeedback],
    );

    const deleteMyFeedback = useDeleteMyFeedback(rating, setError, setRating);

    const mappedProps = useMemo(
      () => mapper({ ...props, rating, isFetchingRating: isFetching, deleteMyFeedback }),
      [isFetching, props, rating, deleteMyFeedback],
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
