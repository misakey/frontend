import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';

import errorTypes from 'constants/errorTypes';
import API from '@misakey/api';

import DataboxSchema from 'store/schemas/Databox';
import { accessRequestUpdate } from 'store/actions/access';
import { receiveDatabox } from 'store/actions/databox';

import identity from '@misakey/helpers/identity';
import path from '@misakey/helpers/path';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';
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
const isValidDatabox = (databox) => isObject(databox) && !isNil(databox.owner);

const mapAccessRequest = ({ owner, ...rest }) => ({
  owner: objectToCamelCase(owner),
  ...objectToCamelCase(rest),
});

const mapDataboxAccessRequest = ({ id, ...rest }) => ({
  databoxId: id,
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
    dispatchAccessRequestUpdate, dispatchReceiveDatabox,
    accessRequest, service, databox,
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
        databox,
        dispatchReceiveDatabox,
        isFetching,
        error,
      }),
      [
        props,
        match,
        location,
        service,
        accessRequest,
        databox,
        dispatchReceiveDatabox,
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
          return readAccessRequest(token)
            .then(mapAccessRequest);
        }
        if (!isNil(databoxId)) {
          return (isValidDatabox(databox)
            ? Promise.resolve(databox)
            : readDatabox(databoxId))
            .then((response) => {
              const box = mapAccessRequest(response);
              dispatchReceiveDatabox(box);
              return mapDataboxAccessRequest(box);
            });
        }
        throw new Error(errorTypes.notFound);
      },
      [token, databoxId, databox, dispatchReceiveDatabox],
    );

    const fetchAccessRequest = useCallback(() => {
      setFetching(true);
      fetchCallback()
        .then((response) => dispatchAccessRequestUpdate(response))
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
    databox: PropTypes.shape(DataboxSchema.propTypes),
    dispatchReceiveDatabox: PropTypes.func.isRequired,
    dispatchAccessRequestUpdate: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    accessRequest: {},
    service: {},
    databox: null,
  };

  // CONNECT
  const mapStateToProps = (state, ownProps) => {
    const accessRequest = state.access.request;

    const databoxId = databoxIdPath(ownProps.match) || accessRequest.databoxId;
    return {
      databox: denormalize(
        databoxId,
        DataboxSchema.entity,
        state.entities,
      ),
      accessRequest,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatchAccessRequestUpdate: (accessRequest) => dispatch(accessRequestUpdate(accessRequest)),
    dispatchReceiveDatabox: (databox) => dispatch(receiveDatabox(databox)),
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withAccessRequest;
