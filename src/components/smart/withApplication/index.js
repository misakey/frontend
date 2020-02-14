import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';
import { parse } from 'tldts';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import usePropChanged from '@misakey/hooks/usePropChanged';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import isEmpty from '@misakey/helpers/isEmpty';
import isString from '@misakey/helpers/isString';
import isArray from '@misakey/helpers/isArray';
import isFunction from '@misakey/helpers/isFunction';
import omit from '@misakey/helpers/omit';
import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import identity from '@misakey/helpers/identity';
import mergeEntitiesNoEmpty from 'helpers/mergeEntities/noEmpty';

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

const EMPTY_APPLICATION_ERROR = new Error();
EMPTY_APPLICATION_ERROR.status = 404;

// HELPERS
const getMainDomain = (props) => {
  const routerPropMainDomain = path(['match', 'params', 'mainDomain'])(props);
  return isNil(routerPropMainDomain) ? prop('mainDomain')(props) : routerPropMainDomain;
};

const defaultMapper = (props) => [
  null,
  null,
  objectToSnakeCase({ ...props, includeRelatedDomains: true }),
];

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

// HOOKS
const useHandlePluginError = (dispatchReceivePlugin, mainDomain) => useCallback(
  (e) => {
    if (IS_PLUGIN) {
      // We can display the basic information from plugin anyway
      return Promise.resolve(dispatchReceivePlugin(mainDomain));
    }
    throw e;
  },
  [dispatchReceivePlugin, mainDomain],
);

const useHandleError = (snackbarError) => useCallback(
  (e) => {
    // rethrow error to useFetchCallback
    if (snackbarError) {
      throw e;
    }
    // don't rethrow error
    return e;
  },
  [snackbarError],
);

const useHandleReceive = (enqueueSnackbar, history, pathname, mainDomain, t) => useCallback(
  (data) => {
    const application = head(data);
    const isLinkedDomain = application.mainDomain !== mainDomain;
    if (isLinkedDomain) {
      if (IS_PLUGIN) {
        const { domainWithoutSuffix } = parse(mainDomain);
        data.push({ ...application, mainDomain, name: domainWithoutSuffix });
      } else {
        enqueueSnackbar(
          t('common:application.linkedDomain.redirect',
            { mainDomainTo: application.mainDomain, mainDomainFrom: mainDomain }),
          { variant: 'info' },
        );
        history.replace(pathname.replace(mainDomain, application.mainDomain));
      }
    }
    return data;
  },
  [enqueueSnackbar, history, mainDomain, pathname, t],
);

const withApplication = (Component, options = {}) => {
  // @FIXME simplify logic of the HOC: params, endpoint, schema
  const {
    endpoint,
    paramMapper,
    propsMapper = identity,
    getSpecificShouldFetch,
    schema = ApplicationSchema,
    snackbarError = false,
  } = options;
  const ComponentWithApplication = (props) => {
    const {
      isAuthenticated, isDefaultDomain, mainDomain,
      entity, dispatchReceive, dispatchReceivePlugin, history, location, t,
    } = props;

    const authChanged = usePropChanged(isAuthenticated);

    const { enqueueSnackbar } = useSnackbar();

    const handleError = useHandleError(snackbarError);
    const handlePluginError = useHandlePluginError(dispatchReceivePlugin, mainDomain);
    const handleReceive = useHandleReceive(
      enqueueSnackbar,
      history,
      location.pathname,
      mainDomain,
      t,
    );

    const shouldFetch = useMemo(() => {
      const validDomain = isString(mainDomain) && !isDefaultDomain;
      const forceFetch = authChanged;
      const defaultShouldFetch = isNil(entity);
      const isFetchNeeded = (
        isNil(getSpecificShouldFetch)
      ) ? defaultShouldFetch : getSpecificShouldFetch(entity);

      return validDomain && (isFetchNeeded || forceFetch);
    }, [isDefaultDomain, entity, mainDomain, authChanged]);

    const startFetching = useCallback(
      () => fetchApplication(mainDomain, isAuthenticated, endpoint, paramMapper)
        .catch(handlePluginError), // catch plugin errors not to set error value from useFetchEffect
      [mainDomain, isAuthenticated, handlePluginError],
    );

    const onFetchApplicationSuccess = useCallback(
      (response) => {
        if (isEmpty(response)) {
          return handlePluginError(EMPTY_APPLICATION_ERROR);
        }
        const data = (isArray(response) ? response : [response]).map(objectToCamelCase);
        return dispatchReceive(handleReceive(data));
      },
      [handlePluginError, dispatchReceive, handleReceive],
    );

    const { isFetching, error } = useFetchEffect(
      startFetching,
      { shouldFetch },
      { onSuccess: onFetchApplicationSuccess, onError: handleError },
    );

    return (
      <Component
        {...omit(propsMapper({
          ...props,
          error,
          isFetching,
          mainDomain,
        }), INTERNAL_PROPS)}
      />
    );
  };

  ComponentWithApplication.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isDefaultDomain: PropTypes.bool.isRequired,
    entity: PropTypes.shape(schema.propTypes),
    mainDomain: PropTypes.string,
    dispatchReceive: PropTypes.func.isRequired,
    dispatchReceivePlugin: PropTypes.func.isRequired,
    userId: PropTypes.string,
    history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
    location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }).isRequired,
    t: PropTypes.func.isRequired,
  };

  ComponentWithApplication.defaultProps = {
    mainDomain: null,
    entity: null,
    userId: null,
  };

  const isDefault = (mainDomain) => mainDomain === 'intro';

  const mapStateToProps = (state, ownProps) => {
    const mainDomain = getMainDomain(ownProps);
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
        schema.collection,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities, mergeEntitiesNoEmpty));
    },
    dispatchReceivePlugin: (mainDomain) => {
      const { domainWithoutSuffix } = parse(mainDomain);
      const data = [{
        mainDomain,
        isUnknown: true,
        id: mainDomain,
        name: `${domainWithoutSuffix.charAt(0).toUpperCase()}${domainWithoutSuffix.slice(1)}`,
      }];
      const normalized = normalize(data, schema.collection);
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
  });

  return withTranslation('common')((connect(mapStateToProps, mapDispatchToProps)(ComponentWithApplication)));
};

export default withApplication;
