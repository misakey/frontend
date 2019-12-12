import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';
import ApplicationSchema from 'store/schemas/Application';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { selectors as contactSelectors } from 'store/reducers/screens/contact';

import { useParams } from 'react-router-dom';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

// HELPERS
const requestDataboxAccess = (id) => API.use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const listDataboxes = (producerId) => API.use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId }))
  .send();

const postDatabox = (payload) => API.use(API.endpoints.application.box.create)
  .build(null, objectToSnakeCase(payload))
  .send();

// COMPONENTS
const withDataboxURL = (mapper = identity) => (Component) => {
  const Wrapper = ({ dispatchContact, ...props }) => {
    const [error, setError] = useState();
    const [isFetching, setIsFetching] = useState();

    const { entity: { id, mainDomain }, isAuthenticated, userId, databoxURL } = props;

    const { mainDomain: mainDomainParam } = useParams();

    const mappedProps = useMemo(
      () => mapper({ ...props, isFetchingDatabox: isFetching, errorDatabox: error }),
      [error, isFetching, props],
    );

    const shouldFetch = useMemo(
      () => {
        const validInternalState = !isFetching && isNil(error);
        const validAuth = isAuthenticated;
        const validEntity = !isNil(mainDomain) && !isNil(id) && mainDomain === mainDomainParam;
        const defaultShouldFetch = isNil(databoxURL);

        return validInternalState && validAuth && validEntity && defaultShouldFetch;
      },
      [databoxURL, error, id, isAuthenticated, isFetching, mainDomain, mainDomainParam],
    );

    const getDatabox = useCallback(
      () => listDataboxes(id)
        .then((databoxes) => head(databoxes)),
      [id],
    );

    const onDatabox = useCallback(
      (databox) => requestDataboxAccess(databox.id)
        .then(({ token }) => {
          const nextDataboxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
          dispatchContact(nextDataboxURL, mainDomain);
        }),
      [dispatchContact, mainDomain],
    );

    const createDatabox = useCallback(
      () => postDatabox({ ownerId: userId, producerId: id }),
      [id, userId],
    );

    useEffect(
      () => {
        if (shouldFetch) {
          setIsFetching(true);
          getDatabox()
            .then((databox) => {
              if (!isNil(databox)) {
                return onDatabox(databox);
              }
              return createDatabox()
                .then((createdDatabox) => onDatabox(createdDatabox));
            })
            .catch(setError)
            .finally(() => {
              setIsFetching(false);
            });
        }
      },
      [getDatabox, onDatabox, createDatabox, shouldFetch, setIsFetching, setError],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    entity: PropTypes.shape(ApplicationSchema.propTypes),
    // CONNECT
    databoxURL: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    userId: PropTypes.string,
    dispatchContact: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    entity: null,
    databoxURL: null,
    isAuthenticated: false,
    userId: null,
  };

  // CONNECT
  const mapStateToProps = (state, props) => ({
    databoxURL: contactSelectors.getDataboxURL(state, props),
    userId: state.auth.userId,
    isAuthenticated: !!state.auth.token,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchContact: (databoxURL, mainDomain) => {
      dispatch(contactDataboxURL(databoxURL, mainDomain));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withDataboxURL;
