import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';
import { makeStyles } from '@material-ui/core/styles';


import API from '@misakey/api';
import { NoPassword } from 'constants/Errors/classes';
import { OPEN, DONE } from 'constants/databox/status';
import { DONE as COMMENT_DONE } from 'constants/databox/comment';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import propEq from '@misakey/helpers/propEq';
import tail from '@misakey/helpers/tail';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getCurrentDatabox, sortDataboxes } from '@misakey/helpers/databox';

import ListQuestions, { useQuestionsItems, getQuestionsItems } from 'components/dumb/List/Questions';
import ScreenError from 'components/dumb/Screen/Error';
import Divider from '@material-ui/core/Divider';
import { usePasswordPrompt, PasswordPromptProvider } from 'components/screens/Citizen/Application/Info/Vault/PasswordPrompt';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';

import CurrentDatabox from 'components/smart/Databox/Current';
import ArchivedDatabox from 'components/smart/Databox/Archived';

import { DefaultSplashScreen } from 'components/dumb/Screen';

import NoDataboxInfoCard from './NoDataboxInfoCard';


// CONSTANTS
const QUESTIONS_TRANS_KEY = 'screens:application.box.questions';

// HELPERS
const idProp = prop('id');
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


const useLoadBackupAndAskPassword = (userId, promptForPassword) => useCallback(async () => {
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
      await crypto.loadSecretBackup(password, backupData);
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
}, [promptForPassword, userId]);

const useInitCrypto = (
  setPublicKeysWeCanDecryptFrom,
  setIsCryptoReadyToDecrypt,
  loadBackupAndAskPassword,
) => useCallback(
  async () => {
    if (crypto.databox.isReadyToDecrypt()) {
      setIsCryptoReadyToDecrypt(true);
      setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
      return;
    }

    try {
      await loadBackupAndAskPassword();
    } catch (e) {
      if (e instanceof NoPassword) {
        // do nothing
        return;
      }
      throw e;
    }
    setIsCryptoReadyToDecrypt(true);
    setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
  },
  [loadBackupAndAskPassword, setIsCryptoReadyToDecrypt, setPublicKeysWeCanDecryptFrom],
);

// COMPONENTS
function ApplicationBox({
  application,
  databoxesByProducer,
  t,
  userId,
  isAuthenticated,
  isLoading,
  onContributionDpoEmailClick,
  dispatchReceiveDataboxesByProducer,
}) {
  const classes = useStyles();

  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState();

  const loading = useMemo(
    () => isLoading || localLoading,
    [isLoading, localLoading],
  );

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

  const [isCryptoReadyToDecrypt, setIsCryptoReadyToDecrypt] = useState(
    crypto.databox.isReadyToDecrypt(),
  );
  const [publicKeysWeCanDecryptFrom, setPublicKeysWeCanDecryptFrom] = useState([]);

  const openPasswordPrompt = usePasswordPrompt();
  const promptForPassword = usePromptForPassword(openPasswordPrompt);
  const loadBackupAndAskPassword = useLoadBackupAndAskPassword(userId, promptForPassword);
  const initCrypto = useInitCrypto(
    setPublicKeysWeCanDecryptFrom,
    setIsCryptoReadyToDecrypt,
    loadBackupAndAskPassword,
  );

  const applicationID = useMemo(
    () => idProp(application),
    [application],
  );

  const shouldFetch = useMemo(
    () => !isLoading && isAuthenticated && !isNil(applicationID)
      && isNil(databoxes) && isNil(error),
    [isAuthenticated, applicationID, databoxes, error, isLoading],
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

  const fetchDatabox = useCallback(() => {
    setLocalLoading(true);

    findDataboxes(applicationID)
      .then((response) => {
        const boxes = response.map(objectToCamelCase);
        dispatchReceiveDataboxesByProducer(applicationID, boxes);
      })
      .catch(({ httpStatus }) => setError(httpStatus))
      .finally(() => setLocalLoading(false));
  }, [applicationID, dispatchReceiveDataboxesByProducer]);

  React.useEffect(
    () => {
      if (isCryptoReadyToDecrypt) {
        setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
      }
    },
    [isCryptoReadyToDecrypt],
  );

  React.useEffect(() => {
    if (shouldFetch) {
      fetchDatabox();
    }
  }, [shouldFetch, fetchDatabox]);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <>
      {(loading && isAuthenticated) ? (
        <DefaultSplashScreen />
      ) : (
        <>
          <CurrentDatabox
            className={classes.box}
            application={application}
            databox={currentDatabox}
            publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
            isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
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
                  publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
                  isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
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

ApplicationBox.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      mainDomain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  isLoading: PropTypes.bool,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  // CONNECT
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databoxesByProducer: PropTypes.shape(DataboxByProducerSchema.propTypes),
  userId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
};

ApplicationBox.defaultProps = {
  application: null,
  databoxesByProducer: null,
  userId: null,
  isAuthenticated: false,
  isLoading: false,
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

const ApplicationBoxComponent = connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common', 'screens', 'input'])(ApplicationBox),
);


function ApplicationBoxWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <ApplicationBoxComponent {...props} />
    </PasswordPromptProvider>
  );
}

export default ApplicationBoxWithPasswordPrompt;
