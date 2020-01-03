import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { withTranslation, Trans } from 'react-i18next';
import moment from 'moment';

import ApplicationSchema from 'store/schemas/Application';
import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { receiveDataboxesByProducer } from 'store/actions/databox';

import API from '@misakey/api';
import { NoPassword } from 'constants/Errors/classes';
import { makeStyles } from '@material-ui/core/styles';
import { OPEN, DONE } from 'constants/databox/status';
import { OK } from 'constants/databox/comment';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import propEq from '@misakey/helpers/propEq';
import tail from '@misakey/helpers/tail';
import sort from '@misakey/helpers/sort';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getCurrentDatabox } from 'helpers/databox';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import ListQuestions, { useQuestionsItems, getQuestionsItems } from 'components/dumb/List/Questions';
import ScreenError from 'components/dumb/Screen/Error';
import SplashScreen from 'components/dumb/SplashScreen';
import BoxMessage from 'components/dumb/Box/Message';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import CardDatabox from 'components/smart/Card/Databox';
import { usePasswordPrompt, PasswordPromptProvider } from 'components/screens/Citizen/Application/Box/PasswordPrompt';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Card from 'components/dumb/Card';
import CardContent from '@material-ui/core/CardContent';
import Title from 'components/dumb/Typography/Title';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummaryDatabox from 'components/smart/ExpansionPanelSummary/Databox';

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

const sortDataboxes = sort((databoxA, databoxB) => {
  if (isDataboxOpen(databoxA)) {
    return -1;
  }
  if (isDataboxOpen(databoxB)) {
    return 1;
  }
  if (moment(databoxA.updatedAt).isAfter(databoxB.updatedAt)) {
    return -1;
  }
  return 1;
});

const findDataboxes = (producerId) => API
  .use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({ producerId }))
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  initCryptoLink: {
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
    color: 'inherit',
  },
  portabilityIllu: {
    width: '100%',
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
const DialogConnectButton = withDialogConnect(Button);

function ApplicationBox({
  application,
  databoxesByProducer,
  t,
  userId,
  isAuthenticated,
  onContributionDpoEmailClick,
  dispatchReceiveDataboxesByProducer,
}) {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
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
    () => isAuthenticated && !isNil(applicationID) && isNil(databoxes) && isNil(error),
    [isAuthenticated, applicationID, databoxes, error],
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

  if (loading) {
    return <SplashScreen variant="default" />;
  }

  return (
    <>
      {(isAuthenticated && !isCryptoReadyToDecrypt && !isEmpty(databoxes)) && (
        <BoxMessage type="warning" my={2}>
          <Typography>{t('screens:application.box.mustUnlockVault')}</Typography>
          <MUILink
            className={classes.initCryptoLink}
            component="button"
            variant="body2"
            onClick={() => {
              initCrypto();
            }}
          >
            {t('screens:application.box.unlockVaultButton')}
          </MUILink>
        </BoxMessage>
      )}
      <CardDatabox
        my={3}
        title={t('screens:application.box.title')}
        application={application}
        databox={currentDatabox}
        publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
        isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
        onAskPassword={loadBackupAndAskPassword}
        onContributionDpoEmailClick={onContributionDpoEmailClick}
      />
      {!isEmpty(archivedDataboxes) && (
        <Card
          my={3}
          title={t('screens:application.box.archives.title')}
        >
          {archivedDataboxes.map((databox) => (
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
              />
            </ExpansionPanel>
          ))}
        </Card>
      )}
      <Card
        my={3}
        title={t('screens:application.box.info.title')}
        primary={!isAuthenticated ? (
          <ButtonConnectSimple buttonProps={{ variant: 'contained' }}>
            {t('screens:application.box.info.primaryButton')}
          </ButtonConnectSimple>
        ) : null}
        secondary={!isAuthenticated ? (
          <DialogConnectButton
            standing={BUTTON_STANDINGS.ENHANCED}
            text={t('screens:application.box.info.secondaryButton')}
          />
        ) : null}
      >
        <Grid container spacing={3}>
          <Grid item sm={8} xs={12}>
            <Typography>
              <Trans i18nKey="screens:application.box.info.details">
                Votre coffre-fort est chiffré par une clé secrète, elle même protégée par votre mot
                de passe. Vous seul avez accès à cette clé qui permet de lire les données contenues
                dans votre coffre. Lorsqu’un site vous envoie des données, elles sont chiffrées
                avant d’être envoyées dans votre coffre afin que vous seul puissiez y accéder.
                Misakey ne peut pas lire vos données.
                <br />
                <br />
                En cas de perte de votre mot de passe, vos données ne seront plus accessibles.
              </Trans>
            </Typography>
          </Grid>
          <Hidden xsDown>
            <Grid item sm={1} />
            <Grid item sm={3}>
              <img
                src="/img/illustrations/portability.png"
                className={classes.portabilityIllu}
                alt={t('screens:application.box.info.altIllu')}
              />
            </Grid>
          </Hidden>
        </Grid>
      </Card>
      <Card>
        <CardContent>
          <Title>{t(`${QUESTIONS_TRANS_KEY}.title`)}</Title>
          <Subtitle>
            <MUILink
              target="_blank"
              rel="nooppener noreferrer"
              href={t('common:links.docs.citizen.faq')}
            >
              {t(`${QUESTIONS_TRANS_KEY}.subtitle`)}
            </MUILink>
          </Subtitle>
        </CardContent>
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
    application,
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
  withTranslation(['common', 'screens'])(ApplicationBox),
);


function ApplicationBoxWithPasswordPrompt({ ...props }) {
  return (
    <PasswordPromptProvider>
      <ApplicationBoxComponent {...props} />
    </PasswordPromptProvider>
  );
}

export default ApplicationBoxWithPasswordPrompt;
