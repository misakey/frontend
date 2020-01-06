import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { denormalize } from 'normalizr';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';
import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { selectors as contactSelectors } from 'store/reducers/screens/contact';

import { useParams } from 'react-router-dom';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { getCurrentDatabox } from 'helpers/databox';

// HELPERS
const idProp = prop('id');
const databoxesProp = prop('databoxes');

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
  const Wrapper = ({
    dispatchContact, dispatchReceiveDataboxesByProducer, databoxesByProducer,
    ...props
  }) => {
    const [error, setError] = useState();
    const [isFetching, setIsFetching] = useState();

    const { entity: { id, mainDomain }, isAuthenticated, userId, databoxURL } = props;

    const { mainDomain: mainDomainParam } = useParams();

    const databox = useMemo(
      () => getCurrentDatabox(databoxesProp(databoxesByProducer), true),
      [databoxesByProducer],
    );

    const mappedProps = useMemo(
      () => mapper({ ...props, databox, isFetchingDatabox: isFetching, errorDatabox: error }),
      [databox, error, isFetching, props],
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
      () => (isNil(databox)
        ? listDataboxes(id)
          .then((response) => {
            const databoxes = (response).map(objectToCamelCase);
            dispatchReceiveDataboxesByProducer(id, databoxes);
            return getCurrentDatabox(databoxes, true);
          })
        : Promise.resolve(databox)),
      [id, dispatchReceiveDataboxesByProducer, databox],
    );

    const onDatabox = useCallback(
      (box) => requestDataboxAccess(box.id)
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
            .then((box) => {
              if (!isNil(box)) {
                return onDatabox(box);
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
    databoxesByProducer: PropTypes.shape(DataboxByProducerSchema.propTypes),
    databoxURL: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    userId: PropTypes.string,
    dispatchContact: PropTypes.func.isRequired,
    dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    entity: null,
    databoxesByProducer: null,
    databoxURL: null,
    isAuthenticated: false,
    userId: null,
  };

  // CONNECT
  const mapStateToProps = (state, props) => {
    const id = idProp(props.entity);
    return {
      databoxesByProducer: isNil(id)
        ? null
        : denormalize(
          id,
          DataboxByProducerSchema.entity,
          state.entities,
        ),
      databoxURL: contactSelectors.getDataboxURL(state, props),
      userId: state.auth.userId,
      isAuthenticated: !!state.auth.token,
    };
  };

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceiveDataboxesByProducer: (producerId, databoxes) => dispatch(
      receiveDataboxesByProducer({ producerId, databoxes }),
    ),
    dispatchContact: (databoxURL, mainDomain) => {
      dispatch(contactDataboxURL(databoxURL, mainDomain));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withDataboxURL;
