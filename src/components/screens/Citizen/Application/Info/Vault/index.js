import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';

import API from '@misakey/api';
import { NoPassword } from 'constants/Errors/classes';
import { OPEN, DONE } from 'constants/databox/status';
import { OK } from 'constants/databox/comment';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import propEq from '@misakey/helpers/propEq';
import tail from '@misakey/helpers/tail';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getCurrentDatabox, sortDataboxes } from 'helpers/databox';

import ListQuestions, { useQuestionsItems, getQuestionsItems } from 'components/dumb/List/Questions';
import ScreenError from 'components/dumb/Screen/Error';
import Typography from '@material-ui/core/Typography';
import CardDatabox from 'components/smart/Card/Databox';
import { usePasswordPrompt, PasswordPromptProvider } from 'components/screens/Citizen/Application/Info/Vault/PasswordPrompt';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummaryDatabox from 'components/smart/ExpansionPanelSummary/Databox';


import Box from '@material-ui/core/Box';
import BoxSection from 'components/dumb/Box/Section';
import Skeleton from '@material-ui/lab/Skeleton';

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
  && databox.dpoComment !== OK;

const findDataboxes = (producerId) => API
  .use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId }))
  .send();

// HOOKS
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
function OnLoading(props) {
  return (
    <>
      <BoxSection mb={3} p={0} {...props}>
        <Box p={3}>
          <Typography variant="h6" component="h5">
            <Skeleton variant="text" style={{ marginTop: 0 }} />
          </Typography>
          <Box mt={1}>
            <Skeleton variant="text" />
          </Box>
          <Box mt={2}>
            <Skeleton variant="rect" height={120} />
          </Box>
        </Box>
      </BoxSection>
    </>
  );
}

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
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState();

  const [expandedBox, setExpandedBox] = useState(null);

  const onExpandedChange = useCallback(
    (databoxId) => (event, isExpanded) => {
      setExpandedBox(isExpanded ? databoxId : null);
    },
    [setExpandedBox],
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
    setLoading(true);

    findDataboxes(applicationID)
      .then((response) => {
        const boxes = response.map(objectToCamelCase);
        dispatchReceiveDataboxesByProducer(applicationID, boxes);
      })
      .catch(({ httpStatus }) => setError(httpStatus))
      .finally(() => setLoading(false));
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
        <OnLoading />
      ) : (
        <>
          <CardDatabox
            mb={3}
            title={t('screens:application.box.title')}
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
              <Title>
                {t('screens:application.box.archives.title')}
              </Title>
                {archivedDataboxes.map((databox) => (
                  <Card mb={3}>
                    <ExpansionPanel
                      key={databox.id}
                      expanded={expandedBox === databox.id}
                      TransitionProps={{ unmountOnExit: true }}
                      elevation={0}
                      onChange={onExpandedChange(databox.id)}
                    >
                      <ExpansionPanelSummaryDatabox databox={databox} />
                      <CardDatabox
                        application={application}
                        databox={databox}
                        publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
                        isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
                        onAskPassword={loadBackupAndAskPassword}
                        onContributionDpoEmailClick={onContributionDpoEmailClick}
                        subCard
                        initCrypto={initCrypto}
                      />
                    </ExpansionPanel>
                  </Card>
                ))}
            </>
          )}
        </>
      )}
      {(isEmpty(databoxes) && !loading) && (
        <NoDataboxInfoCard isAuthenticated={isAuthenticated} />
      )}

      <Title>{t(`${QUESTIONS_TRANS_KEY}.title`)}</Title>
      <Card dense>
        <ListQuestions items={questionItems} breakpoints={{ sm: 6, xs: 12 }} />
        <ListQuestions items={conditionalQuestionItems} breakpoints={{ sm: 6, xs: 12 }} />
      </Card>
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