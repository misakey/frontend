import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';
import { parse } from 'tldts';

import usePropChanged from 'hooks/usePropChanged';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isString from '@misakey/helpers/isString';
import isArray from '@misakey/helpers/isArray';
import isFunction from '@misakey/helpers/isFunction';
import omit from '@misakey/helpers/omit';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { IS_PLUGIN } from 'constants/plugin';

// CONSTANTS
const DEFAULT_ENDPOINT = {
  method: 'GET',
  path: '/application-info',
};

const INTERNAL_PROPS = ['dispatchReceive', 'dispatchReceivePlugin'];

// HELPERS
const defaultMapper = (props) => [null, null, objectToSnakeCase(props)];

const fetchApplication = (mainDomain, isAuthenticated, endpoint, paramMapper) => {
  const authEndpoint = isNil(endpoint)
    ? { ...DEFAULT_ENDPOINT, auth: isAuthenticated }
    : { ...endpoint, auth: isAuthenticated };
  const mapper = isFunction(paramMapper) ? paramMapper : defaultMapper;
  return API
    .use(authEndpoint)
    .build(...(mapper({ mainDomain })))
    .send();
};

const withApplication = (Component, options = {}) => {
  // @FIXME simplify logic of the HOC: params, endpoint, schema
  const { endpoint, paramMapper, getSpecificShouldFetch, schema = ApplicationSchema } = options;
  const ComponentWithApplication = (props) => {
    const {
      isAuthenticated, isDefaultDomain, mainDomain,
      entity, dispatchReceive, dispatchReceivePlugin,
    } = props;

    const authChanged = usePropChanged(isAuthenticated);

    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);


    const shouldFetch = useMemo(() => {
      const validDomain = isString(mainDomain) && !isDefaultDomain;
      const validInternalState = !isFetching && isNil(error);
      const forceFetch = authChanged;
      const defaultShouldFetch = isNil(entity);
      const isFetchNeeded = (
        isNil(getSpecificShouldFetch)
      ) ? defaultShouldFetch : getSpecificShouldFetch(entity);

      return validDomain && validInternalState && (isFetchNeeded || forceFetch);
    }, [isDefaultDomain, isFetching, error, entity, mainDomain, authChanged]);

    const startFetching = useCallback(() => {
      setIsFetching(true);

      fetchApplication(mainDomain, isAuthenticated, endpoint, paramMapper)
        .then((response) => {
          if (isEmpty(response)) {
            // @FIXME: is it still useful ?
            if (IS_PLUGIN) {
              dispatchReceivePlugin(mainDomain);
            } else {
              setError(404);
            }
          } else if (isArray(response)) {
            dispatchReceive(response.map(objectToCamelCase));
          } else {
            dispatchReceive(objectToCamelCase(response));
          }
        })
        .catch((e) => {
          if (IS_PLUGIN) {
            // We can display the basic information from plugin anyway
            dispatchReceivePlugin(mainDomain);
          } else { setError(e); }
        })
        .finally(() => { setIsFetching(false); });
    }, [
      setIsFetching, dispatchReceive, setError,
      isAuthenticated, mainDomain, dispatchReceivePlugin,
    ]);

    useEffect(
      () => {
        if (shouldFetch) {
          startFetching();
        }
      }, [shouldFetch, startFetching],
    );

    return (
      <Component
        {...omit(props, INTERNAL_PROPS)}
        error={error}
        isFetching={isFetching}
        mainDomain={mainDomain}
      />
    );
  };

  ComponentWithApplication.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isDefaultDomain: PropTypes.bool.isRequired,
    entity: PropTypes.shape(schema.propTypes),
    mainDomain: PropTypes.string.isRequired,
    dispatchReceive: PropTypes.func.isRequired,
    dispatchReceivePlugin: PropTypes.func.isRequired,
    userId: PropTypes.string,
  };

  ComponentWithApplication.defaultProps = {
    entity: null,
    userId: null,
  };

  const isDefault = (mainDomain) => mainDomain === 'intro';

  const mapStateToProps = (state, ownProps) => {
    const { mainDomain } = ownProps.match.params;
    return {
      isAuthenticated: !!state.auth.token,
      isDefaultDomain: isDefault(mainDomain),
      entity: denormalize(
        mainDomain,
        schema.entity,
        state.entities,
      ),
      mainDomain,
      userId: state.auth.userId,
      userRoles: !isNil(state.auth.roles) ? state.auth.roles : [],
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceive: (data) => {
      const normalized = normalize(
        data,
        isArray(data)
          ? schema.collection
          : schema.entity,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
    dispatchReceivePlugin: (mainDomain) => {
      const { domainWithoutSuffix } = parse(mainDomain);
      const data = [{
        mainDomain,
        unknown: true,
        id: mainDomain,
        name: `${domainWithoutSuffix.charAt(0).toUpperCase()}${domainWithoutSuffix.slice(1)}`,
      }];
      const normalized = normalize(data, schema.collection);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(ComponentWithApplication);
};

export default withApplication;
