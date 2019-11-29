import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import API from '@misakey/api';

import { accessRequestUpdate } from 'store/actions/accessRequest';


import path from '@misakey/helpers/path';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

// CONSTANTS
const ACCESS_REQUEST_READ_TOKEN = {
  method: 'GET',
  path: '/databoxes/access-request/:token',
};

const ACCESS_REQUEST_READ_ID = {
  method: 'GET',
  path: '/databoxes/:id/access-request',
  auth: true,
};

// HELPERS
const readAccessRequest = (query, endpoint) => API
  .use(endpoint)
  .build(query)
  .send();

const databoxIdPath = path(['params', 'databoxId']);

// COMPONENTS
const withAccessRequest = (Component) => {
  const Wrapper = ({ match, location, dispatchAccessRequestUpdate, accessRequest, ...props }) => {
    const [isFetching, setFetching] = useState(false);
    const [error, setError] = useState(null);

    const hash = useMemo(() => location.hash, [location.hash]);
    const databoxId = useMemo(() => databoxIdPath(match), [match]);

    const query = useMemo(
      () => (isEmpty(hash) ? { id: databoxId } : { token: hash.substr(1) }),
      [hash, databoxId],
    );
    const endpoint = useMemo(
      () => (isEmpty(hash) ? ACCESS_REQUEST_READ_ID : ACCESS_REQUEST_READ_TOKEN),
      [hash],
    );

    const fetchAccessRequest = useCallback(() => {
      setFetching(true);

      readAccessRequest(query, endpoint)
        .then((response) => {
          dispatchAccessRequestUpdate(objectToCamelCase(response));
        })
        .catch((e) => { setError(e); })
        .finally(() => { setFetching(false); });
    }, [query, endpoint, setError, setFetching, dispatchAccessRequestUpdate]);

    useEffect(() => {
      if (isEmpty(accessRequest) && !error) {
        fetchAccessRequest();
      }
    }, [error, fetchAccessRequest, accessRequest]);

    return (
      <Component
        match={match}
        location={location}
        accessRequest={accessRequest}
        isFetching={isFetching}
        error={error}
        {...props}
      />
    );
  };

  Wrapper.propTypes = {
    match: PropTypes.shape({
      params: PropTypes.object.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      hash: PropTypes.string.isRequired,
    }).isRequired,
    // CONNECT
    accessRequest: PropTypes.object,
    dispatchAccessRequestUpdate: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    accessRequest: {},
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    accessRequest: state.accessRequest,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchAccessRequestUpdate: (accessRequest) => {
      dispatch(accessRequestUpdate(accessRequest));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withAccessRequest;
