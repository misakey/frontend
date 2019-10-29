import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';

import parseJwt from '@misakey/helpers/parseJwt';
import isString from '@misakey/helpers/isString';
import isEmpty from '@misakey/helpers/isEmpty';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

// CONSTANTS
const DEFAULT_ENDPOINT = {
  method: 'GET',
  path: '/application-info',
};

const fetchApplication = (mainDomain, isAuthenticated, endpoint) => {
  const authEndpoint = isNil(endpoint)
    ? { ...DEFAULT_ENDPOINT, auth: isAuthenticated }
    : { ...endpoint, auth: isAuthenticated };
  return API
    .use(authEndpoint)
    .build(null, null, objectToSnakeCase({ mainDomain }))
    .send();
};

const withApplication = (Component, options = {}) => {
  const { endpoint } = options;
  const ComponentWithApplication = (props) => {
    const {
      isAuthenticated, isDefaultDomain, mainDomain,
      entity, dispatchReceive, dispatchReceivePlugin,
    } = props;

    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);

    const shouldFetch = useMemo(() => {
      const validDomain = isString(mainDomain) && !isDefaultDomain;
      const validComponentState = !isFetching && isNil(error) && isNil(entity);

      return validDomain && validComponentState;
    }, [isDefaultDomain, isFetching, error, entity, mainDomain]);

    const startFetching = useCallback(() => {
      if (shouldFetch) {
        setIsFetching(true);

        fetchApplication(mainDomain, isAuthenticated, endpoint)
          .then((response) => {
            dispatchReceive(response.map(objectToCamelCase));
            if (window.env.PLUGIN && isEmpty(response)) {
              dispatchReceivePlugin(mainDomain);
            }
          })
          .catch((e) => {
            if (window.env.PLUGIN && e.status === 404) {
              dispatchReceivePlugin(mainDomain);
            } else { setError(e); }
          })
          .finally(() => { setIsFetching(false); });
      }
    }, [
      shouldFetch, setIsFetching, dispatchReceive, setError,
      isAuthenticated, mainDomain, dispatchReceivePlugin,
    ]);

    useEffect(startFetching, [mainDomain]);

    return (
      <Component
        {...props}
        error={error}
        isFetching={shouldFetch || isFetching === true}
        mainDomain={mainDomain}
      />
    );
  };

  ComponentWithApplication.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isDefaultDomain: PropTypes.bool.isRequired,
    entity: PropTypes.shape(ApplicationSchema.propTypes),
    mainDomain: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    dispatchReceive: PropTypes.func.isRequired,
    dispatchReceivePlugin: PropTypes.func.isRequired,
    userId: PropTypes.string,
  };

  ComponentWithApplication.defaultProps = {
    entity: null,
    userId: null,
  };

  const isDefault = (mainDomain) => mainDomain === 'service';

  const mapStateToProps = (state, ownProps) => {
    const { mainDomain } = ownProps.match.params;
    return {
      isAuthenticated: !!state.auth.token,
      isDefaultDomain: isDefault(mainDomain),
      entity: denormalize(
        mainDomain,
        ApplicationSchema.entity,
        state.entities,
      ),
      mainDomain,
      userId: !isEmpty(state.auth.id) ? parseJwt(state.auth.id).sub : null,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatch,
    dispatchReceive: (data) => {
      const normalized = normalize(data, ApplicationSchema.collection);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
    dispatchReceivePlugin: (mainDomain) => {
      const data = [{
        mainDomain,
        unknown: true,
        id: mainDomain,
        name: `${mainDomain.charAt(0).toUpperCase()}${mainDomain.slice(1)}`,
      }];
      const normalized = normalize(data, ApplicationSchema.collection);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(ComponentWithApplication);
};

export default withApplication;
