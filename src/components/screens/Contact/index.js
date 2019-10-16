import React, { useState, useCallback, useMemo, lazy } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import { connect } from 'react-redux';
import { normalize, denormalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';
import { receiveEntities } from '@misakey/store/actions/entities';

import { selectors as contactSelectors } from 'store/reducers/screens/contact';
import { makeMatchParamSelector } from 'store/reducers/helpers/makeMatchParamsSelector';

import API from '@misakey/api';
import routes from 'routes';

import useAsync from '@misakey/hooks/useAsync';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

import SplashScreen from '@misakey/ui/SplashScreen';

// LAZY
const ContactPreview = lazy(() => import('components/screens/Contact/Preview'));
const ContactProviders = lazy(() => import('components/screens/Contact/Providers'));

// CONSTANTS

const APP_INFO_ENDPOINT = {
  method: 'GET',
  path: '/application-info',
  auth: true,
};

// HELPERS
const fetchApplication = (mainDomain) => API
  .use(APP_INFO_ENDPOINT)
  .build(null, null, objectToSnakeCase({ mainDomain }))
  .send();

// HOOKS
const useShouldFetch = (isFetching, error, entity) => useMemo(
  () => !isFetching && isNil(error) && isNil(entity),
  [isFetching, error, entity],
);

const useGetApplication = (
  mainDomain, shouldFetch, dispatchReceive, setIsFetching, setError,
) => useCallback(() => {
  if (shouldFetch && !isNil(mainDomain)) {
    setIsFetching(true);
    return fetchApplication(mainDomain)
      .then((responseBody) => {
        const data = responseBody.map(objectToCamelCase);
        dispatchReceive(data);
        setIsFetching(false);
      })
      .catch((error) => {
        const httpStatus = error.httpStatus ? error.httpStatus : 500;
        setError(httpStatus);
        setIsFetching(false);
      });
  }
  return null;
}, [mainDomain, shouldFetch, dispatchReceive, setIsFetching, setError]);

// COMPONENTS
const Contact = ({
  entity,
  mainDomain,
  databoxURL,
  dispatchReceive,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const shouldFetch = useShouldFetch(isFetching, error, entity);

  const getApplication = useGetApplication(
    mainDomain, shouldFetch, dispatchReceive, setIsFetching, setError,
  );

  useAsync(getApplication, mainDomain);

  if (isFetching) {
    return <SplashScreen />;
  }

  return (
    <Switch>
      <Route
        path={routes.contact.preview}
        render={(routerProps) => (
          <ContactPreview entity={entity} databoxURL={databoxURL} {...routerProps} />
        )}
      />
      <Route
        path={routes.contact._}
        exact
        render={(routerProps) => (
          <ContactProviders entity={entity} databoxURL={databoxURL} {...routerProps} />
        )}
      />
    </Switch>
  );
};

Contact.propTypes = {
  // CONNECT
  mainDomain: PropTypes.string,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
  dispatchReceive: PropTypes.func.isRequired,
};

Contact.defaultProps = {
  mainDomain: null,
  entity: null,
  databoxURL: null,
};

// CONNECT
const matchParamSelector = makeMatchParamSelector('mainDomain');

const mapStateToProps = (state, props) => {
  const mainDomain = matchParamSelector(state, props);
  return {
    mainDomain,
    databoxURL: contactSelectors.getDataboxURL(state, props),
    entity: denormalize(
      mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceive: (data) => {
    const normalized = normalize(data, ApplicationSchema.collection);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Contact);
