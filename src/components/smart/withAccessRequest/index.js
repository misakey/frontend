import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import errorTypes from 'constants/errorTypes';
import API from '@misakey/api';

import { accessRequestUpdate } from 'store/actions/access';

import identity from '@misakey/helpers/identity';
import path from '@misakey/helpers/path';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

// CONSTANTS
const ACCESS_REQUEST_READ_TOKEN = {
  method: 'GET',
  path: '/databoxes/access-request/:token',
};

const DATABOX_READ = {
  method: 'GET',
  path: '/databoxes/:id',
  auth: true,
};

// HELPERS
const mapDataboxAccessRequest = ({ owner, id, ...rest }) => ({
  databoxId: id,
  owner: objectToCamelCase(owner),
  ...rest,
});

const readAccessRequest = (token) => API
  .use(ACCESS_REQUEST_READ_TOKEN)
  .build({ token })
  .send();

const readDatabox = (id) => API
  .use(DATABOX_READ)
  .build({ id }, null, objectToSnakeCase({ withUser: true }))
  .send();

const databoxIdPath = path(['params', 'databoxId']);

// COMPONENTS
const withAccessRequest = (Component, mapper = identity) => {
  const Wrapper = ({
    match, location,
    dispatchAccessRequestUpdate,
    accessRequest, service,
    ...props
  }) => {
    const [isFetching, setFetching] = useState(false);
    const [error, setError] = useState(null);

    const hash = useMemo(() => location.hash, [location.hash]);
    const databoxId = useMemo(() => databoxIdPath(match), [match]);

    const mappedProps = useMemo(
      () => mapper({
        ...props,
        match,
        location,
        service,
        accessRequest,
        isFetching,
        error,
      }),
      [
        props,
        match,
        location,
        service,
        accessRequest,
        isFetching,
        error,
      ],
    );

    const token = useMemo(
      () => (!isEmpty(hash) ? hash.substr(1) : null),
      [hash],
    );

    const idMatches = useMemo(
      () => {
        if (!isNil(token)) {
          return accessRequest.token === token;
        }
        if (!isNil(databoxId)) {
          return accessRequest.databoxId === databoxId;
        }
        return false;
      },
      [token, databoxId, accessRequest],
    );

    const shouldFetch = useMemo(
      () => (
        isEmpty(accessRequest)
        || (!isEmpty(accessRequest) && !idMatches)
      ) && isNil(error) && !isFetching,
      [error, accessRequest, idMatches, isFetching],
    );

    const fetchCallback = useCallback(
      () => {
        if (!isNil(token)) {
          return readAccessRequest(token);
        }
        if (!isNil(databoxId)) {
          return readDatabox(databoxId)
            .then(mapDataboxAccessRequest);
        }
        throw new Error(errorTypes.notFound);
      },
      [token, databoxId],
    );

    const fetchAccessRequest = useCallback(() => {
      setFetching(true);
      fetchCallback()
        .then((response) => dispatchAccessRequestUpdate(objectToCamelCase(response)))
        .catch((e) => { setError(e); })
        .finally(() => { setFetching(false); });
    }, [fetchCallback, setError, setFetching, dispatchAccessRequestUpdate]);

    useEffect(() => {
      if (shouldFetch) {
        fetchAccessRequest();
      }
    }, [shouldFetch, fetchAccessRequest]);

    return (
      <Component
        {...mappedProps}
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
    service: PropTypes.shape({
      id: PropTypes.string,
      mainDomain: PropTypes.string,
      dpoEmail: PropTypes.string,
    }),
    // CONNECT
    accessRequest: PropTypes.shape({
      databoxId: PropTypes.string,
      owner: PropTypes.shape({
        displayName: PropTypes.string,
        email: PropTypes.string,
        handle: PropTypes.string,
      }),
      producerId: PropTypes.string,
      token: PropTypes.string,
    }),
    dispatchAccessRequestUpdate: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    accessRequest: {},
    service: {},
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    accessRequest: state.access.request,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchAccessRequestUpdate: (accessRequest) => dispatch(accessRequestUpdate(accessRequest)),
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withAccessRequest;
