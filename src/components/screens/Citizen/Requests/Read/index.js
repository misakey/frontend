import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect, useDispatch } from 'react-redux';
import { denormalize, normalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { useRouteMatch, useLocation } from 'react-router-dom';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';

import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import ApplicationByIdSchema from 'store/schemas/Application/ById';

import ensureSecretsLoaded from '@misakey/crypto/store/actions/ensureSecretsLoaded';

import API from '@misakey/api';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import getDateFormat from '@misakey/helpers/getDateFormat';
import getSearchParams from '@misakey/helpers/getSearchParams';
import propEq from '@misakey/helpers/propEq';

import { receiveEntities } from '@misakey/store/actions/entities';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import { usePasswordPrompt, PasswordPromptProvider } from 'components/dumb/PasswordPrompt';

import { DRAFT, CLOSED, DONE, OPEN } from 'constants/databox/status';
import { DONE as COMMENT_DONE } from 'constants/databox/comment';
import DataboxSchema from 'store/schemas/Databox';

import CurrentDatabox from 'components/smart/Databox/Current';
import ArchivedDatabox from 'components/smart/Databox/Archived';
import DraftRequest from 'components/smart/Requests/Draft';

import ListQuestions, { useQuestionsItems, getQuestionsItems } from 'components/dumb/List/Questions';
import Divider from '@material-ui/core/Divider';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import ScreenAction from 'components/dumb/Screen/Action';
import BoxEllipsisApplicationLink from 'components/dumb/Box/Ellipsis/Application/Link';
import useGetThemeForRequestType from 'hooks/useGetThemeForRequestType';

// CONSTANTS
const NAVIGATION_PROPS = {
  homePath: routes.citizen._,
};

// HELPERS
const getRequest = (id) => API
  .use(API.endpoints.application.box.read)
  .build({ id }, null, objectToSnakeCase({ withUser: true }))
  .send();

const getApplication = (id) => API
  .use({ ...API.endpoints.application.info.read, auth: true })
  .build({ id })
  .send();

// HELPERS
const isOpen = propEq('status', OPEN);
const isDone = propEq('status', DONE);
const isCommentKO = (request) => !isNil(request)
  && isDone(request)
  && request.dpoComment !== COMMENT_DONE;

// HOOKS
const useStyles = makeStyles((theme) => ({
  divider: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 300,
  },
  box: {
    marginBottom: theme.spacing(3),
  },
}));


const useFetchRequest = (params) => useCallback(
  () => getRequest(params.id),
  [params.id],
);

const useFetchApplication = (producerId) => useCallback(
  () => (!isNil(producerId) ? getApplication(producerId) : null),
  [producerId],
);

const useOnSuccessRequest = (dispatchReceiveRequest) => useCallback(
  (response) => {
    const request = objectToCamelCase(response);
    dispatchReceiveRequest(request);
  },
  [dispatchReceiveRequest],
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
  isAuthenticated,
  dispatchReceiveApplication,
  dispatchReceiveRequest,
  t,
}) {
  const classes = useStyles();
  // Used to prevent refetch on delete request
  const [preventFetching, setPreventFetching] = useState(false);

  const { status, producerId, sentAt, type, producer } = useMemo(() => request || {}, [request]);
  const { application } = useMemo(() => producer || {}, [producer]);

  const { params } = useRouteMatch();
  const { search } = useLocation();
  const dispatch = useDispatch();
  const openPasswordPrompt = usePasswordPrompt();
  const fetchRequest = useFetchRequest(params);
  const fetchApplication = useFetchApplication(producerId);
  const onSuccessRequest = useOnSuccessRequest(dispatchReceiveRequest);
  const onSuccessApplication = useOnSuccessApplication(dispatchReceiveApplication);

  const initCrypto = useCallback(
    () => dispatch(ensureSecretsLoaded({ openPasswordPrompt })),
    [dispatch, openPasswordPrompt],
  );

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const isClosed = useMemo(
    () => status === CLOSED,
    [status],
  );

  const shouldFetchRequest = useMemo(
    () => isAuthenticated && isNil(request) && !isNil(params.id) && !preventFetching,
    [isAuthenticated, params.id, preventFetching, request],
  );

  const shouldFetchApplication = useMemo(
    () => isNil(application) && !isNil(request),
    [application, request],
  );

  const { isFetching: isFetchingRequest } = useFetchEffect(
    fetchRequest,
    { shouldFetch: shouldFetchRequest },
    { onSuccess: onSuccessRequest },
  );

  const { isFetching: isFetchingApplication } = useFetchEffect(
    fetchApplication,
    { shouldFetch: shouldFetchApplication },
    { onSuccess: onSuccessApplication },
  );

  const state = useMemo(
    () => ({ isFetching: isFetchingApplication || isFetchingRequest }),
    [isFetchingApplication, isFetchingRequest],
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

  const questionItems = useQuestionsItems(t, 'citizen:requests.read.questions', 4);
  const conditionalQuestionItems = useMemo(
    () => {
      if (!isNil(request) && isOpen(request)) {
        return getQuestionsItems(t, 'citizen:requests.read.questions.open', 3);
      }
      if (isCommentKO(request)) {
        return getQuestionsItems(t, 'citizen:requests.read.questions.done', 1);
      }
      return [];
    },
    [request, t],
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

  const onDelete = useCallback(() => { setPreventFetching(true); }, []);
  const themeforType = useGetThemeForRequestType(type);

  if (shouldDisplayContactScreen) {
    return (
      <DraftRequest
        themeforType={themeforType}
        request={request}
        application={application}
        onPreventRefetch={onDelete}
        isFetchingRequest={isFetchingRequest}
        isFetchingApplication={isFetchingApplication}
      />
    );
  }

  return (
    <ScreenAction
      title={title}
      navigationProps={NAVIGATION_PROPS}
      {...screenProps}
    >
      <ThemeProvider theme={themeforType}>
        <Container maxWidth="md">
          {!isNil(request) && (
          <CurrentDatabox
            className={classes.box}
            application={application}
            databox={request}
            initCrypto={initCrypto}
          />
          )}
          {isClosed && (
          <ArchivedDatabox
            className={classes.box}
            databox={request}
            application={application}
            initCrypto={initCrypto}
          />
          )}
          <Divider className={classes.divider} />
          <Title>{t('citizen:requests.read.questions.title')}</Title>
          <Card dense>
            <ListQuestions items={questionItems} breakpoints={{ sm: 6, xs: 12 }} />
            <ListQuestions items={conditionalQuestionItems} breakpoints={{ sm: 6, xs: 12 }} />
          </Card>
        </Container>
      </ThemeProvider>

    </ScreenAction>
  );
}

RequestsRead.propTypes = {
  t: PropTypes.func.isRequired,
  // CONNECT
  request: PropTypes.shape(DataboxByProducerSchema.propTypes),
  isAuthenticated: PropTypes.bool,
  dispatchReceiveApplication: PropTypes.func.isRequired,
  dispatchReceiveRequest: PropTypes.func.isRequired,
};

RequestsRead.defaultProps = {
  request: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state, ownProps) => ({
  request: denormalize(
    ownProps.match.params.id,
    DataboxSchema.entity,
    state.entities,
  ),
  userId: state.auth.userId,
  isAuthenticated: state.auth.isAuthenticated,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchReceiveRequest: (data) => {
    const normalized = normalize(
      data,
      DataboxSchema.entity,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
  },
  dispatchReceiveApplication: ({ id, ...rest }) => {
    const normalized = normalize(
      { id, application: { id, ...rest } },
      ApplicationByIdSchema.entity,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
  },
});

const RequestDetailsConnected = connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['citizen'])(RequestsRead),
);


function RequestDetailsWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <RequestDetailsConnected {...props} />
    </PasswordPromptProvider>
  );
}

export default RequestDetailsWithPasswordPrompt;
