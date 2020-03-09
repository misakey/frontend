import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';
import ensureSecretsLoaded from '@misakey/crypto/store/actions/ensureSecretsLoaded';
import { makeStyles } from '@material-ui/core/styles';

import API from '@misakey/api';
import { OPEN, DONE } from 'constants/databox/status';
import { DONE as COMMENT_DONE } from 'constants/databox/comment';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import propEq from '@misakey/helpers/propEq';
import tail from '@misakey/helpers/tail';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getCurrentDatabox, sortDataboxes } from '@misakey/helpers/databox';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import ListQuestions, { useQuestionsItems, getQuestionsItems } from 'components/dumb/List/Questions';
import Divider from '@material-ui/core/Divider';
import { usePasswordPrompt, PasswordPromptProvider } from 'components/screens/Citizen/Application/Info/Vault/PasswordPrompt';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';

import CurrentDatabox from 'components/smart/Databox/Current';
import ArchivedDatabox from 'components/smart/Databox/Archived';

import DefaultSplashScreen from '@misakey/ui/Screen/Splash';

import NoDataboxInfoCard from './NoDataboxInfoCard';


// CONSTANTS
const DEFAULT_KEY = 'key';

// HELPERS
const idProp = prop('id');
const idPropOrDefaultKey = propOr(DEFAULT_KEY, 'id');
const databoxesProp = prop('databoxes');
const isDataboxOpen = propEq('status', OPEN);
const isDataboxDone = propEq('status', DONE);
const isDataboxCommentKO = (databox) => !isNil(databox)
  && isDataboxDone(databox)
  && databox.dpoComment !== COMMENT_DONE;

const findDataboxes = (producerId) => API
  .use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId, withUsers: true }))
  .send();

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

// COMPONENTS
function ApplicationInfoVault({
  application,
  databoxesByProducer,
  t,
  isAuthenticated,
  onContributionDpoEmailClick,
  dispatchReceiveDataboxesByProducer,
}) {
  const classes = useStyles();

  const databoxes = useMemo(
    () => {
      const notSorted = databoxesProp(databoxesByProducer);
      return isEmpty(notSorted) ? notSorted : sortDataboxes(notSorted);
    },
    [databoxesByProducer],
  );

  const currentDatabox = useMemo(
    () => getCurrentDatabox(databoxes),
    [databoxes],
  );

  const currentDataboxKey = useMemo(
    () => idPropOrDefaultKey(currentDatabox),
    [currentDatabox],
  );

  const archivedDataboxes = useMemo(
    () => {
      if (isEmpty(databoxes)) {
        return [];
      }
      // if current databox is nil, do not remove head from list of archived boxes
      if (isNil(currentDatabox)) {
        return databoxes;
      }
      return tail(databoxes);
    },
    [databoxes, currentDatabox],
  );

  const dispatch = useDispatch();
  const openPasswordPrompt = usePasswordPrompt();

  const initCrypto = useCallback(
    () => dispatch(ensureSecretsLoaded({ openPasswordPrompt })),
    [dispatch, openPasswordPrompt],
  );

  const applicationID = useMemo(
    () => idProp(application),
    [application],
  );

  const shouldFetch = useMemo(
    () => isAuthenticated && !isNil(applicationID)
      && isNil(databoxes),
    [isAuthenticated, applicationID, databoxes],
  );

  const questionItems = useQuestionsItems(t, 'citizen__new:application.info.vault.questions', 4);
  const conditionalQuestionItems = useMemo(
    () => {
      if (!isNil(currentDatabox) && isDataboxOpen(currentDatabox)) {
        return getQuestionsItems(t, 'citizen__new:application.info.vault.questions.open', 3);
      }
      if (isDataboxCommentKO(currentDatabox)) {
        return getQuestionsItems(t, 'citizen__new:application.info.vault.questions.done', 1);
      }
      return [];
    },
    [currentDatabox, t],
  );

  const fetchDatabox = useCallback(
    () => findDataboxes(applicationID),
    [applicationID],
  );

  const onSuccess = useCallback(
    (response) => {
      const boxes = response.map(objectToCamelCase);
      dispatchReceiveDataboxesByProducer(applicationID, boxes);
    },
    [applicationID, dispatchReceiveDataboxesByProducer],
  );


  const { isFetching } = useFetchEffect(
    fetchDatabox,
    { shouldFetch },
    { onSuccess },
  );

  return (
    <>
      {(isFetching && isAuthenticated) ? (
        <DefaultSplashScreen />
      ) : (
        <>
          <CurrentDatabox
            key={currentDataboxKey}
            className={classes.box}
            application={application}
            databox={currentDatabox}
            onContributionDpoEmailClick={onContributionDpoEmailClick}
            initCrypto={initCrypto}
          />
          {!isEmpty(archivedDataboxes) && (
            <>
              {archivedDataboxes.map((databox) => (
                <ArchivedDatabox
                  className={classes.box}
                  key={databox.id}
                  databox={databox}
                  application={application}
                  onContributionDpoEmailClick={onContributionDpoEmailClick}
                  initCrypto={initCrypto}
                />
              ))}
            </>
          )}
          {(isEmpty(databoxes)) && (
            <NoDataboxInfoCard />
          )}
          <Divider className={classes.divider} />
          <Title>{t('citizen__new:application.info.vault.questions.title')}</Title>
          <Card dense>
            <ListQuestions items={questionItems} breakpoints={{ sm: 6, xs: 12 }} />
            <ListQuestions items={conditionalQuestionItems} breakpoints={{ sm: 6, xs: 12 }} />
          </Card>
        </>
      )}
    </>
  );
}

ApplicationInfoVault.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      mainDomain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  // CONNECT
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databoxesByProducer: PropTypes.shape(DataboxByProducerSchema.propTypes),
  isAuthenticated: PropTypes.bool,
  dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
};

ApplicationInfoVault.defaultProps = {
  application: null,
  databoxesByProducer: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const application = denormalize(
    ownProps.match.params.mainDomain,
    ApplicationSchema.entity,
    state.entities,
  );
  const producerId = idProp(application);
  return {
    databoxesByProducer: isNil(producerId) ? null : denormalize(
      producerId,
      DataboxByProducerSchema.entity,
      state.entities,
    ),
    userId: state.auth.userId,
    isAuthenticated: !!state.auth.token,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceiveDataboxesByProducer: (producerId, databoxes) => dispatch(
    receiveDataboxesByProducer({ producerId, databoxes }),
  ),
});

const ApplicationInfoVaultComponent = connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['citizen__new'])(ApplicationInfoVault),
);


function ApplicationInfoVaultWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <ApplicationInfoVaultComponent {...props} />
    </PasswordPromptProvider>
  );
}

export default ApplicationInfoVaultWithPasswordPrompt;
