import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';
import { normalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';
import { receiveDataboxesByProducer } from 'store/actions/databox';
import { contactDataboxURLById } from 'store/actions/screens/contact';

import identity from '@misakey/helpers/identity';
import difference from '@misakey/helpers/difference';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import keyBy from '@misakey/helpers/keyBy';
import groupBy from '@misakey/helpers/groupBy';
import mapValues from '@misakey/helpers/mapValues';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { getCurrentDatabox } from '@misakey/helpers/databox';
import { receiveEntities } from '@misakey/store/actions/entities';
import DataboxSchema from 'store/schemas/Databox';
import { withTranslation } from 'react-i18next';

const fetchApplications = (ids) => API
  .use({ ...API.endpoints.application.find, auth: true })
  .build(null, null, objectToSnakeCase({ ids }))
  .send();

const requestDataboxAccess = (id) => API
  .use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const listDataboxes = (producerId) => API
  .use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId }))
  .send();

const createDatabox = (payload) => API
  .use(API.endpoints.application.box.create)
  .build(null, objectToSnakeCase(payload))
  .send();

const useCurrentDataboxByProducer = (databoxes) => useMemo(() => {
  const databoxesByProducer = groupBy(databoxes, 'producerId');
  return mapValues(databoxesByProducer, (values) => getCurrentDatabox(values, true));
}, [databoxes]);

// COMPONENTS
const withBulkContact = (mapper = identity) => (Component) => {
  const Wrapper = ({
    dispatchContact, dispatchReceiveDataboxesByProducer, dispatchReceive,
    ...props
  }) => {
    const [databoxesErrors, setDataboxesErrors] = useState({});
    const [applicationsError, setApplicationsError] = useState(null);
    const [isFetchingApplications, setIsFetchingApplications] = useState(false);
    const [isFetchingDataboxes, setIsFetchingDataboxes] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const {
      isAuthenticated, userId, selectedApplications,
      databoxURLsById, applicationsByIds, databoxes, t,
    } = props;

    const currentDataboxesByProducer = useCurrentDataboxByProducer(databoxes);

    const missingDataboxeUrls = useMemo(
      () => difference(selectedApplications, Object.keys(databoxURLsById)),
      [databoxURLsById, selectedApplications],
    );

    const missingApplicationsInfo = useMemo(
      () => difference(selectedApplications, Object.keys(applicationsByIds)),
      [applicationsByIds, selectedApplications],
    );
    const isFetchingApplicationBulk = useMemo(
      () => (
        isFetchingApplications || (!isEmpty(missingApplicationsInfo) && isNil(applicationsError))
      ),
      [applicationsError, isFetchingApplications, missingApplicationsInfo],
    );

    const isFetchingDataboxesBulk = useMemo(
      () => (isFetchingDataboxes || (!isEmpty(missingDataboxeUrls) && isEmpty(databoxesErrors))),
      [databoxesErrors, isFetchingDataboxes, missingDataboxeUrls],
    );

    const isFetchingBulk = useMemo(
      () => isFetchingApplicationBulk || isFetchingDataboxesBulk,
      [isFetchingApplicationBulk, isFetchingDataboxesBulk],
    );

    const mappedProps = useMemo(
      () => mapper({
        ...props,
        isFetchingBulk,
        errorBulk: {
          applicationsError,
          databoxesErrors,
        },
        selectedApplications,
        databoxURLsById,
        applicationsByIds,
        currentDataboxesByProducer,
      }),
      [
        props, isFetchingBulk, applicationsError, databoxesErrors, selectedApplications,
        databoxURLsById, applicationsByIds, currentDataboxesByProducer,
      ],
    );

    const shouldFetchDataboxes = useMemo(
      () => {
        const validInternalState = missingDataboxeUrls.length > 0
          && !isFetchingDataboxes && isEmpty(databoxesErrors);
        const validAuth = isAuthenticated;

        return validInternalState && validAuth;
      },
      [databoxesErrors, isAuthenticated, isFetchingDataboxes, missingDataboxeUrls.length],
    );

    const shouldFetchApplications = useMemo(
      () => {
        const validInternalState = missingApplicationsInfo.length > 0
          && !isFetchingApplications && isNil(applicationsError);
        const validAuth = isAuthenticated;

        return validInternalState && validAuth;
      },
      [applicationsError, isAuthenticated, isFetchingApplications, missingApplicationsInfo.length],
    );

    const onDatabox = useCallback(
      (box, id, alreadyContacted) => requestDataboxAccess(box.id)
        .then(({ token }) => {
          const nextDataboxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
          dispatchContact(nextDataboxURL, id, alreadyContacted);
        }),
      [dispatchContact],
    );

    const createDataboxForUser = useCallback(
      (id) => createDatabox({ ownerId: userId, producerId: id }),
      [userId],
    );

    const fetchDataboxes = useCallback(() => {
      const fullPromises = missingDataboxeUrls.map((id) => listDataboxes(id)
        .then((response) => {
          const boxes = response.map(objectToCamelCase);
          dispatchReceiveDataboxesByProducer(id, boxes);
          const databox = getCurrentDatabox(boxes, true);
          if (!isNil(databox)) {
            return onDatabox(databox, id, true);
          }
          return createDataboxForUser(id)
            .then((createdDatabox) => onDatabox(createdDatabox, id));
        })
        .catch((error) => setDataboxesErrors((errors) => ({ ...errors, [id]: error }))));

      try {
        return Promise.all(fullPromises);
      } catch (error) {
        if (error instanceof TypeError) {
          enqueueSnackbar(t('common:incompatibleBrowser'), { variant: 'warning' });
        }
        return Promise.reject(error);
      }
    }, [createDataboxForUser, dispatchReceiveDataboxesByProducer,
      enqueueSnackbar, missingDataboxeUrls, onDatabox, t]);

    useEffect(
      () => {
        if (shouldFetchDataboxes) {
          setIsFetchingDataboxes(true);
          fetchDataboxes().finally(() => { setIsFetchingDataboxes(false); });
        }
      },
      [fetchDataboxes, shouldFetchDataboxes],
    );

    useEffect(() => {
      if (shouldFetchApplications) {
        setIsFetchingApplications(true);
        fetchApplications(missingApplicationsInfo)
          .then((response) => {
            dispatchReceive(response.map(objectToCamelCase));
          })
          .catch((err) => { setApplicationsError(err); })
          .finally(() => { setIsFetchingApplications(false); });
      }
    },
    [dispatchReceive, fetchDataboxes, isAuthenticated,
      missingApplicationsInfo, shouldFetchApplications]);

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    applicationsByIds: PropTypes.objectOf(PropTypes.shape(ApplicationSchema.propTypes)).isRequired,
    databoxURLsById: PropTypes.objectOf(PropTypes.shape({
      databoxURL: PropTypes.string,
      alreadyContacted: PropTypes.bool,
    })).isRequired,
    databoxes: PropTypes.objectOf(PropTypes.shape(DataboxSchema.propTypes)).isRequired,
    selectedApplications: PropTypes.arrayOf(PropTypes.string).isRequired,
    isAuthenticated: PropTypes.bool,
    userId: PropTypes.string,
    dispatchReceive: PropTypes.func.isRequired,
    dispatchContact: PropTypes.func.isRequired,
    dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    isAuthenticated: false,
    userId: null,
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    databoxURLsById: state.screens.contact.databoxURLsById,
    databoxes: state.entities.databoxes,
    applicationsByIds: keyBy(Object.values(state.entities.applications), 'id'),
    selectedApplications: state.screens.applications.selected,
    userId: state.auth.userId,
    isAuthenticated: !!state.auth.token,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceive: (data) => {
      const normalized = normalize(
        data,
        ApplicationSchema.collection,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities));
    },
    dispatchReceiveDataboxesByProducer: (producerId, databoxes) => dispatch(
      receiveDataboxesByProducer({ producerId, databoxes }),
    ),
    dispatchContact: (databoxURL, id, alreadyContacted) => dispatch(
      contactDataboxURLById(databoxURL, id, alreadyContacted),
    ),
  });

  return connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common'])(Wrapper));
};

export default withBulkContact;
