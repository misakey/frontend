import React, { useMemo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { denormalize } from 'normalizr';
import { connect } from 'react-redux';

import API from '@misakey/api';
import routes from 'routes';
import { IS_PLUGIN } from 'constants/plugin';
import { WORKSPACE } from 'constants/workspaces';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import UserEmailSchema from 'store/schemas/UserEmail';
import { receiveDataboxesByProducer, addDataboxByProducer, setDataboxMeta } from 'store/actions/databox';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { selectors as contactSelectors } from 'store/reducers/screens/contact';
import { addToUserApplications } from 'store/actions/applications/userApplications';

import { useParams } from 'react-router-dom';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import identity from '@misakey/helpers/identity';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import compose from '@misakey/helpers/compose';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { getCurrentDatabox } from '@misakey/helpers/databox';

import withUserEmails from 'components/smart/withUserEmails';

// HELPERS
const idProp = prop('id');
const databoxesProp = prop('databoxes');
const getUserEmailId = (userEmails) => idProp(head(userEmails || []));

const getDataboxMeta = compose(
  ({ dpoEmail, owner }) => ({ dpoEmail, owner: objectToCamelCase(owner) }),
  objectToCamelCase,
);

const requestDataboxAccess = (id) => API.use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const listDataboxes = (producerId, params) => API.use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId, ...params }))
  .send();

const postDatabox = (payload) => API.use(API.endpoints.application.box.create)
  .build(null, objectToSnakeCase(payload))
  .send();

// COMPONENTS
const withDataboxURL = (
  {
    mapper = identity,
    params = {},
    getExtraShouldFetch,
  } = {},
) => (Component) => {
  const Wrapper = ({
    isFetchingUserEmails,
    dispatchContact, dispatchReceiveDataboxesByProducer, dispatchAddToUserApplications,
    databoxesByProducer, dispatchAddDataboxByProducer, dispatchSetDataboxMeta,
    ...props
  }) => {
    const { entity: { id, mainDomain }, isAuthenticated, userId, databoxURL, userEmails } = props;

    const { mainDomain: mainDomainParam } = useParams();

    const [isNewDatabox, setIsNewDatabox] = useState(null);

    const databox = useMemo(
      () => getCurrentDatabox(databoxesProp(databoxesByProducer), true),
      [databoxesByProducer],
    );

    const userEmailId = useMemo(
      () => getUserEmailId(userEmails),
      [userEmails],
    );

    const shouldFetch = useMemo(
      () => {
        const validAuth = isAuthenticated;
        const validUserEmailId = !isNil(userEmailId);
        const validEntity = !isNil(mainDomain) && !isNil(id) && mainDomain === mainDomainParam;
        const valid = validAuth && validUserEmailId && validEntity;

        const defaultShouldFetch = isNil(databoxURL) || isNil(databox);

        const extraShouldFetch = isFunction(getExtraShouldFetch)
          ? getExtraShouldFetch(databox)
          : false;

        return valid && (defaultShouldFetch || extraShouldFetch);
      },
      [isAuthenticated, userEmailId, mainDomain, id, mainDomainParam, databoxURL, databox],
    );

    const getDatabox = useCallback(
      () => (isNil(databox)
        ? listDataboxes(id, params)
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
        .then(({ token, ...rest }) => {
          const href = IS_PLUGIN ? window.env.APP_URL : window.env.href;
          const nextDataboxURL = parseUrlFromLocation(`${routes.requests}#${token}`, href).href;
          dispatchSetDataboxMeta(box.id, getDataboxMeta(rest));
          dispatchContact(nextDataboxURL, mainDomain);
        }),
      [dispatchContact, dispatchSetDataboxMeta, mainDomain],
    );

    const createDatabox = useCallback(
      () => postDatabox({ ownerId: userId, producerId: id, userEmailId }),
      [id, userEmailId, userId],
    );

    const databoxFetchCallback = useCallback(
      () => getDatabox()
        .then((box) => {
          if (!isNil(box)) {
            setIsNewDatabox(false);
            return onDatabox(box);
          }
          setIsNewDatabox(true);
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

    useEffect(
      () => {
        if (!shouldFetch && isNil(isNewDatabox)) {
          setIsNewDatabox(false);
        }
      },
      [shouldFetch, isNewDatabox],
    );

    const { isFetching, error } = useFetchEffect(
      databoxFetchCallback,
      { shouldFetch },
    );

    const mappedProps = useMemo(
      () => mapper({
        ...props,
        databox,
        isNewDatabox,
        isFetchingDatabox: isFetching || isFetchingUserEmails,
        errorDatabox: error,
      }),
      [props, databox, isNewDatabox, isFetching, isFetchingUserEmails, error],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    entity: PropTypes.shape(ApplicationSchema.propTypes),
    // CONNECT
    databoxesByProducer: PropTypes.shape(DataboxByProducerSchema.propTypes),
    databoxURL: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    dispatchContact: PropTypes.func.isRequired,
    dispatchAddDataboxByProducer: PropTypes.func.isRequired,
    dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
    dispatchAddToUserApplications: PropTypes.func.isRequired,
    dispatchSetDataboxMeta: PropTypes.func.isRequired,
    // withUserEmails
    userId: PropTypes.string,
    userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
    isFetchingUserEmails: PropTypes.bool,
  };

  Wrapper.defaultProps = {
    entity: null,
    databoxesByProducer: null,
    databoxURL: null,
    isAuthenticated: false,
    userId: null,
    userEmails: null,
    isFetchingUserEmails: false,
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
    dispatchSetDataboxMeta: (databoxId, meta) => dispatch(setDataboxMeta(databoxId, meta)),
    dispatchContact: (databoxURL, mainDomain) => {
      dispatch(contactDataboxURL(databoxURL, mainDomain));
    },
  });

  return connect(mapStateToProps, mapDispatchToProps)(withUserEmails(Wrapper));
};

export default withDataboxURL;
