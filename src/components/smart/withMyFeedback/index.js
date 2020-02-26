import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';

import API from '@misakey/api';

import ApplicationSchema from 'store/schemas/Application';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchCallback from '@misakey/hooks/useFetch/callback';

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

    const { enqueueSnackbar } = useSnackbar();

    const { application: { id }, isAuthenticated, userId, t } = props;
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

    const { isFetching } = useFetchEffect(
      getMyFeedback,
      { shouldFetch },
      { onSuccess: onGetFeedbackSuccess },
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
        enqueueSnackbar(t('common__new:feedback.deleted'), { variant: 'success' });
      },
      [enqueueSnackbar, t],
    );

    const { wrappedFetch: deleteMyFeedback, isFetching: isDeletingFeedback } = useFetchCallback(
      onDelete,
      { onSuccess: onDeleteSuccess },
    );

    const mappedProps = useMemo(
      () => mapper({
        ...omitTranslationProps(props),
        rating,
        isFetchingFeedback: isFetching,
        deleteMyFeedback,
        isDeletingFeedback,
      }),
      [props, rating, isFetching, deleteMyFeedback, isDeletingFeedback],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    ...PROP_TYPES,
    t: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = { ...DEFAULT_PROPS };

  // CONNECT
  const mapStateToProps = (state) => {
    const { userId, token } = state.auth;
    return {
      isAuthenticated: !!token,
      userId,
    };
  };

  return connect(mapStateToProps, {})(withTranslation('common__new')(Wrapper));
};

export default withMyFeedback;
