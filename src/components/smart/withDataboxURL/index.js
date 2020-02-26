import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { denormalize } from 'normalizr';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';
import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer, addDataboxByProducer } from 'store/actions/databox';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { selectors as contactSelectors } from 'store/reducers/screens/contact';
import { addToUserApplications } from 'store/actions/applications/userApplications';

import { useParams } from 'react-router-dom';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { getCurrentDatabox } from '@misakey/helpers/databox';
import { IS_PLUGIN } from 'constants/plugin';
import { WORKSPACE } from 'constants/workspaces';

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
    dispatchContact, dispatchReceiveDataboxesByProducer, dispatchAddToUserApplications,
    databoxesByProducer, dispatchAddDataboxByProducer,
    ...props
  }) => {
    const { entity: { id, mainDomain }, isAuthenticated, userId, databoxURL } = props;

    const { mainDomain: mainDomainParam } = useParams();

    const databox = useMemo(
      () => getCurrentDatabox(databoxesProp(databoxesByProducer), true),
      [databoxesByProducer],
    );

    const shouldFetch = useMemo(
      () => {
        const validAuth = isAuthenticated;
        const validEntity = !isNil(mainDomain) && !isNil(id) && mainDomain === mainDomainParam;
        const defaultShouldFetch = isNil(databoxURL);

        return validAuth && validEntity && defaultShouldFetch;
      },
      [databoxURL, id, isAuthenticated, mainDomain, mainDomainParam],
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
          const href = IS_PLUGIN ? window.env.APP_URL : window.env.href;
          const nextDataboxURL = parseUrlFromLocation(`${routes.requests}#${token}`, href).href;
          dispatchContact(nextDataboxURL, mainDomain);
        }),
      [dispatchContact, mainDomain],
    );

    const createDatabox = useCallback(
      () => postDatabox({ ownerId: userId, producerId: id }),
      [id, userId],
    );

    const databoxFetchCallback = useCallback(
      () => getDatabox()
        .then((box) => {
          if (!isNil(box)) {
            return onDatabox(box);
          }
          return createDatabox()
            .then((createdDatabox) => Promise.all([
              dispatchAddToUserApplications({ mainDomain, workspace: WORKSPACE.CITIZEN }),
              dispatchAddDataboxByProducer(id, objectToCamelCase(createdDatabox)),
              onDatabox(createdDatabox),
            ]));
        }),
      [
        getDatabox, createDatabox, onDatabox,
        dispatchAddToUserApplications, dispatchAddDataboxByProducer,
        mainDomain, id,
      ],
    );

    const { isFetching, error } = useFetchEffect(
      databoxFetchCallback,
      { shouldFetch },
    );

    const mappedProps = useMemo(
      () => mapper({ ...props, databox, isFetchingDatabox: isFetching, errorDatabox: error }),
      [databox, error, isFetching, props],
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
    dispatchAddDataboxByProducer: PropTypes.func.isRequired,
    dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
    dispatchAddToUserApplications: PropTypes.func.isRequired,
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
    dispatchAddToUserApplications: ({ mainDomain, workspace }) => dispatch(
      addToUserApplications(workspace, mainDomain),
    ),
    dispatchReceiveDataboxesByProducer: (producerId, databoxes) => dispatch(
      receiveDataboxesByProducer({ producerId, databoxes }),
    ),
    dispatchAddDataboxByProducer: (producerId, databox) => dispatch(
      addDataboxByProducer({ producerId, databox }),
    ),
    dispatchContact: (databoxURL, mainDomain) => {
      dispatch(contactDataboxURL(databoxURL, mainDomain));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withDataboxURL;
