import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect } from 'react-redux';
import { normalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import ApplicationByIdSchema from 'store/schemas/Application/ById';


import API from '@misakey/api';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import getDateFormat from '@misakey/helpers/getDateFormat';
import getSearchParams from '@misakey/helpers/getSearchParams';

import { receiveEntities } from '@misakey/store/actions/entities';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { PasswordPromptProvider } from 'components/dumb/PasswordPrompt';

import { DRAFT } from 'constants/databox/status';

import DraftRequest from 'components/smart/Requests/Draft';
import withRequestDetails from 'components/smart/withRequestDetails';
import CitizenRequestReadActions from 'components/screens/Citizen/Requests/Read/Actions';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import ScreenAction from 'components/dumb/Screen/Action';
import BoxEllipsisApplicationLink from 'components/dumb/Box/Ellipsis/Application/Link';
import RequestSummary from 'components/dumb/Request/Summary';
import RequestEvents from 'components/dumb/Request/Events';
import useGetThemeForRequestType from 'hooks/useGetThemeForRequestType';

// CONSTANTS
const NAVIGATION_PROPS = {
  homePath: routes.citizen._,
};

// HELPERS

const getApplication = (id) => API
  .use({ ...API.endpoints.application.info.read, auth: true })
  .build({ id })
  .send();

const useFetchApplication = (producerId) => useCallback(
  () => (!isNil(producerId) ? getApplication(producerId) : null),
  [producerId],
);

const useOnSuccessApplication = (dispatchReceiveApplication) => useCallback(
  (response) => {
    dispatchReceiveApplication(objectToCamelCase(response));
  },
  [dispatchReceiveApplication],
);

// COMPONENTS
function RequestsRead({
  request,
  isFetching,
  dispatchReceiveApplication,
  onDelete,
  t,
}) {
  // Used to prevent refetch on delete request

  const { status, producerId, sentAt, type, producer } = useMemo(() => request || {}, [request]);
  const { application } = useMemo(() => producer || {}, [producer]);

  const { search } = useLocation();
  const fetchApplication = useFetchApplication(producerId);
  const onSuccessApplication = useOnSuccessApplication(dispatchReceiveApplication);

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const shouldFetchApplication = useMemo(
    () => isNil(application) && !isNil(request),
    [application, request],
  );

  const { isFetching: isFetchingApplication } = useFetchEffect(
    fetchApplication,
    { shouldFetch: shouldFetchApplication },
    { onSuccess: onSuccessApplication },
  );

  const state = useMemo(
    () => ({ isFetching: isFetchingApplication || isFetching.request }),
    [isFetching.request, isFetchingApplication],
  );

  const shouldDisplayContactScreen = useMemo(() => (
    status === DRAFT || searchParams.reopen === 'true' || searchParams.recontact === 'true'
  ), [searchParams.recontact, searchParams.reopen, status]);

  const title = useMemo(
    () => t('citizen:requests.read.title', {
      date: getDateFormat(sentAt, 'll'),
      type: t(`citizen:requests.type.${type}`),
    }),
    [sentAt, t, type],
  );

  const items = useMemo(
    () => ([<BoxEllipsisApplicationLink key="application" application={application} />]),
    [application],
  );

  const screenProps = useMemo(
    () => ({
      state,
      appBarProps: { items },
    }),
    [items, state],
  );

  const themeforType = useGetThemeForRequestType(type);

  if (shouldDisplayContactScreen) {
    return (
      <DraftRequest
        themeforType={themeforType}
        request={request}
        application={application}
        onPreventRefetch={onDelete}
        isFetchingRequest={isFetching.request}
        isFetchingApplication={isFetchingApplication}
      />
    );
  }

  return (
    <ScreenAction
      title={title}
      hideTitle
      navigation={(
        <RequestSummary
          request={request}
          isFetching={isFetching.logs || isFetching.blobs}
          margin="auto"
        />
      )}
      navigationProps={NAVIGATION_PROPS}
      {...screenProps}
    >

      <Container component={Box} maxWidth="md" display="flex" flexDirection="column" flexGrow={1} justifyContent="space-between">
        <RequestEvents
          request={request}
          isFetching={isFetching.logs || isFetching.blobs}
        />
        <CitizenRequestReadActions request={request} />
      </Container>

    </ScreenAction>
  );
}

RequestsRead.propTypes = {
  t: PropTypes.func.isRequired,
  // withRequestDetails
  request: PropTypes.shape(DataboxByProducerSchema.propTypes),
  isFetching: PropTypes.shape({
    request: PropTypes.bool,
    logs: PropTypes.bool,
    blobs: PropTypes.bool,
  }),
  onDelete: PropTypes.func.isRequired,
  // CONNECT
  dispatchReceiveApplication: PropTypes.func.isRequired,
};

RequestsRead.defaultProps = {
  request: null,
  isFetching: {
    request: false,
    logs: false,
    blobs: false,
  },
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceiveApplication: ({ id, ...rest }) => {
    const normalized = normalize(
      { id, application: { id, ...rest } },
      ApplicationByIdSchema.entity,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
  },
});

const RequestDetailsConnected = connect(null, mapDispatchToProps)(
  withTranslation(['citizen'])(withRequestDetails()(RequestsRead)),
);


function RequestDetailsWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <RequestDetailsConnected {...props} />
    </PasswordPromptProvider>
  );
}

export default RequestDetailsWithPasswordPrompt;
