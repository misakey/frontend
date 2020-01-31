import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import API from '@misakey/api';

import ApplicationSchema from 'store/schemas/Application';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import useFetchEffect from 'hooks/useFetch/effect';
import useFetchCallback from 'hooks/useFetch/callback';

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

const deleteFeedback = (ratingId) => API
  .use(ENDPOINTS.ratings.delete)
  .build({ id: ratingId })
  .send();

// HOOKS
const useShouldFetch = (isAuthenticated, userId, id, rating) => useMemo(
  () => isAuthenticated && !isNil(userId) && !isNil(id) && isNil(rating),
  [isAuthenticated, userId, id, rating],
);

// COMPONENTS
const withMyFeedback = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const [rating, setRating] = useState(null);

    const { application: { id }, isAuthenticated, userId } = props;
    const shouldFetch = useShouldFetch(isAuthenticated, userId, id, rating);

    const getMyFeedback = useCallback(
      () => fetchMyFeedback(id, userId),
      [id, userId],
    );
    const onGetFeedbackSuccess = useCallback(
      (response) => {
        const data = response.map(objectToCamelCase);
        setRating(head(data));
      },
      [setRating],
    );

    const { error, isFetching } = useFetchEffect(
      getMyFeedback,
      { shouldFetch },
      { onSuccess: onGetFeedbackSuccess, onError: true },
    );

    const onDelete = useCallback(
      () => {
        const { id: ratingId } = rating;
        return !isNil(ratingId)
          ? deleteFeedback(ratingId)
          : Promise.resolve();
      },
      [rating],
    );

    const onDeleteSuccess = useCallback(
      () => {
        setRating(null);
      },
      [setRating],
    );

    const { callback: deleteMyFeedback, error: deleteError } = useFetchCallback(
      onDelete,
      { onSuccess: onDeleteSuccess, onError: true },
    );

    const mappedProps = useMemo(
      () => mapper({ ...props, rating, isFetchingRating: isFetching, deleteMyFeedback }),
      [isFetching, props, rating, deleteMyFeedback],
    );

    if (error || deleteError) {
      return <ScreenError httpStatus={error.httpStatus || deleteError.httpStatus} />;
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
