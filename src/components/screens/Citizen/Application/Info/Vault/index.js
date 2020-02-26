import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';
import { loadSecretsBackup } from '@misakey/crypto/store/actions';
import { makeStyles } from '@material-ui/core/styles';

import API from '@misakey/api';
import NoPassword from 'constants/Errors/classes/NoPassword';
import { OPEN, DONE } from 'constants/databox/status';
import { DONE as COMMENT_DONE } from 'constants/databox/comment';

import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

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
const QUESTIONS_TRANS_KEY = 'screens:application.box.questions';
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
  .build(null, null, objectToSnakeCase({ producerId }))
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

const usePromptForPassword = (openPasswordPrompt) => useCallback(
  (previousAttemptFailed = false) => (
    openPasswordPrompt({ firstAttempt: !previousAttemptFailed })
      .then(({ password }) => {
        if (isNil(password)) { throw new NoPassword(); }
        return password;
      })),
  [openPasswordPrompt],
);


const useLoadBackupAndAskPassword = (
  userId,
  promptForPassword,
  dispatchLoadSecretsBackup,
) => useCallback(async () => {
  const promisedPassword = promptForPassword();

  const promisedBackupData = API.use(API.endpoints.user.getSecretBackup)
    .build({ id: userId })
    .send()
    .then((response) => response.data);

  // we cannot use 'const backupData' because of destructuration
  /* eslint-disable prefer-const */
  let [
    password,
    backupData,
  ] = await Promise.all([promisedPassword, promisedBackupData]);
  /* eslint-enable prefer-const */

  // this ESLint rule is about loops where iterations are independent from one another,
  // which is not the case here (next loop is executed if previous loop failed)
  // @FIXME consider using recursion instead?
  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await dispatchLoadSecretsBackup(password, backupData);
      break;
    } catch (e) {
      if (e instanceof BackupDecryptionError) {
        password = await promptForPassword(/* previousAttemptFailed = */true);
      } else {
        throw e;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
}, [promptForPassword, userId, dispatchLoadSecretsBackup]);

const useInitCrypto = (
  loadBackupAndAskPassword,
) => useCallback(
  async () => {
    try {
      await loadBackupAndAskPassword();
    } catch (e) {
      if (e instanceof NoPassword) {
        // do nothing
        return;
      }
      throw e;
    }
  },
  [loadBackupAndAskPassword],
);

// COMPONENTS
function ApplicationInfoVault({
  application,
  databoxesByProducer,
  t,
  userId,
  isAuthenticated,
  onContributionDpoEmailClick,
  dispatchReceiveDataboxesByProducer,
  dispatchLoadSecretsBackup,
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

  const openPasswordPrompt = usePasswordPrompt();
  const promptForPassword = usePromptForPassword(openPasswordPrompt);
  const loadBackupAndAskPassword = useLoadBackupAndAskPassword(
    userId,
    promptForPassword,
    dispatchLoadSecretsBackup,
  );
  const initCrypto = useInitCrypto(
    loadBackupAndAskPassword,
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

  const questionItems = useQuestionsItems(t, QUESTIONS_TRANS_KEY, 4);
  const conditionalQuestionItems = useMemo(
    () => {
      if (!isNil(currentDatabox) && isDataboxOpen(currentDatabox)) {
        return getQuestionsItems(t, `${QUESTIONS_TRANS_KEY}.open`, 3);
      }
      if (isDataboxCommentKO(currentDatabox)) {
        return getQuestionsItems(t, `${QUESTIONS_TRANS_KEY}.done`, 1);
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
            onAskPassword={loadBackupAndAskPassword}
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
                  onAskPassword={loadBackupAndAskPassword}
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
          <Title>{t(`${QUESTIONS_TRANS_KEY}.title`)}</Title>
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
  userId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
  dispatchLoadSecretsBackup: PropTypes.func.isRequired,
};

ApplicationInfoVault.defaultProps = {
  application: null,
  databoxesByProducer: null,
  userId: null,
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
  dispatchLoadSecretsBackup: (password, backupData) => dispatch(
    loadSecretsBackup(password, backupData),
  ),
});

const ApplicationInfoVaultComponent = connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common', 'screens', 'input'])(ApplicationInfoVault),
);


function ApplicationInfoVaultWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <ApplicationInfoVaultComponent {...props} />
    </PasswordPromptProvider>
  );
}

export default ApplicationInfoVaultWithPasswordPrompt;
