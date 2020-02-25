import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import API from '@misakey/api';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';
import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import propOr from '@misakey/helpers/propOr';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import { receiveApplicationsByCategories } from 'store/actions/applications/ByCategory';
import ApplicationsByCategorySchema from 'store/schemas/ApplicationsByCategory';
import ApplicationSchema from 'store/schemas/Application';
import { denormalize } from 'normalizr';

// CONSTANTS
const ACTIVE_SERVICES_MAIN_DOMAINS = window.env.ACTIVE_SERVICES;


// HELPERS
const propOrNull = propOr(null);

// COMPONENTS
const withActiveServices = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const handleGenericHttpErrors = useHandleGenericHttpErrors();
    const { isAuthenticated, activeServices, dispatch, ...rest } = props;

    const shouldFetch = useMemo(() => isNil(activeServices), [activeServices]);

    const fetchServices = useCallback(
      () => API
        .use({ ...API.endpoints.application.info.find, auth: isAuthenticated })
        .build(null, null, objectToSnakeCase({ mainDomains: ACTIVE_SERVICES_MAIN_DOMAINS.join() }))
        .send()
        .then((applications) => dispatch(receiveApplicationsByCategories({
          identifier: 'active',
          applications: applications.map(objectToCamelCase),
        })))
        .catch(handleGenericHttpErrors),
      [dispatch, handleGenericHttpErrors, isAuthenticated],
    );

    const { isFetching } = useFetchEffect(
      fetchServices,
      { shouldFetch },
    );

    const mappedProps = useMemo(
      () => mapper({
        activeServices: activeServices || [],
        isFetchingActiveServices: isFetching,
        isAuthenticated,
        ...rest,
      }),
      [activeServices, isAuthenticated, isFetching, rest],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    activeServices: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
    isAuthenticated: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    activeServices: null,
    isAuthenticated: null,
  };

  // CONNECT
  const mapStateToProps = (state) => {
    const denormalized = denormalize(
      'active',
      ApplicationsByCategorySchema.entity,
      state.entities,
    );
    return {
      isAuthenticated: state.auth.isAuthenticated,
      activeServices: propOrNull('applications', denormalized),
    };
  };

  return connect(mapStateToProps)(Wrapper);
};

export default withActiveServices;
