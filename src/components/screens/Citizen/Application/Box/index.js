import React, { useCallback } from 'react';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { denormalize } from 'normalizr';
import fileDownload from 'js-file-download';
import { withTranslation, Trans } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import API from '@misakey/api';

import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';

import deburr from '@misakey/helpers/deburr';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import SplashScreen from 'components/dumb/SplashScreen';
import ScreenError from 'components/dumb/Screen/Error';
import BoxMessage from 'components/dumb/Box/Message';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonConnectSimple from 'components/dumb/Button/Connect/Simple';

import DataboxDisplay from 'components/screens/Citizen/Application/Box/DataboxDisplay';


import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import ContactButton from 'components/smart/ContactButton';
import { makeStyles } from '@material-ui/core/styles';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import Card from 'components/dumb/Card';

import { NoPassword } from 'constants/Errors/classes';

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

function promptForPassword(t, previousAttemptFailed = false) {
  return Swal.fire({
    title: t(`screens:application.box.${previousAttemptFailed ? 'wrongPassword' : 'needPassword'}`),
    input: 'password',
    cancelButtonText: t('cancel'),
    showCancelButton: true,
    inputPlaceholder: t('password'),
    reverseButtons: true,
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off',
    },
  })
    .then(({ value: password }) => {
      if (isNil(password)) { throw new NoPassword(); }

      return password;
    });
}

async function loadBackupAndAskPassword(t, userId) {
  const promisedPassword = promptForPassword(t);

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
        password = await promptForPassword(t, /* previousAttemptFailed = */true);
      } else {
        throw e;
      }
    }
  }
  /* eslint-enable no-await-in-loop */
}

async function initCrypto({ t, userId, setPublicKeysWeCanDecryptFrom, setIsCryptoReadyToDecrypt }) {
  if (crypto.databox.isReadyToDecrypt()) {
    setIsCryptoReadyToDecrypt(true);
    setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
    return;
  }

  try {
    await loadBackupAndAskPassword(t, userId);
  } catch (e) {
    if (e instanceof NoPassword) {
      // do nothing
      return;
    }
    throw e;
  }
  setIsCryptoReadyToDecrypt(true);
  setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
}

// COMPONENTS
const DialogConnectButton = withDialogConnect(Button);

function ApplicationBox({
  application,
  match,
  t,
  userId,
  isAuthenticated,
  onContributionDpoEmailClick,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [blobs, setBlobs] = React.useState(null);

  const [isCryptoReadyToDecrypt, setIsCryptoReadyToDecrypt] = React.useState(
    crypto.databox.isReadyToDecrypt(),
  );
  const [publicKeysWeCanDecryptFrom, setPublicKeysWeCanDecryptFrom] = React.useState([]);

  const { mainDomain } = match.params;

  function errorSnackBar(translationKey) {
    const text = t(translationKey);
    enqueueSnackbar(text, { variant: 'error' });
  }

  function fetchBlobs(databoxId) {
    setLoading(true);
    API.use(API.endpoints.application.box.blob.find)
      .build(undefined, undefined, { databox_ids: [databoxId] })
      .send()
      .then((response) => setBlobs(response.map(objectToCamelCase)))
      .catch(({ httpStatus }) => setError(httpStatus))
      .finally(() => setLoading(false));
  }

  const fetchDatabox = useCallback(() => {
    if (isAuthenticated && application && application.id) {
      setError(false);
      setLoading(true);

      API.use(API.endpoints.application.box.find)
        .build(null, null, { producer_id: application.id })
        .send()
        .then((databoxes) => databoxes.forEach(({ id }) => {
          fetchBlobs(id);
        }))
        .catch(({ httpStatus }) => setError(httpStatus))
        .finally(() => setLoading(false));
    }
  }, [application, isAuthenticated]);

  async function readBlob(id) {
    try {
      return (
        await API.use(API.endpoints.application.box.blob.read)
          .build({ id })
          .send()
      );
    } catch (e) {
      errorSnackBar('screens:databox.errors.getBlob');
      return {};
    }
  }

  async function downloadBlob(id) {
    try {
      const [blobMetadata] = blobs.filter((blob) => (blob.id === id));
      if (!blobMetadata) { throw Error(`no metadata in state for blob ${id}`); }
      const { fileExtension } = blobMetadata;
      const {
        nonce,
        ephemeral_producer_pub_key: ephemeralProducerPubKey,
      } = blobMetadata.encryption;

      if (!crypto.databox.isReadyToDecrypt()) {
        try {
          await loadBackupAndAskPassword(t, userId);
        } catch (e) {
          if (e instanceof NoPassword) {
            // do nothing
            return;
          }
          throw e;
        }
      }
      const { blob: ciphertext } = await readBlob(id);

      if (!ciphertext || ciphertext.size === 0) {
        errorSnackBar('screens:databox.errors.default');
        return;
      }

      const decryptedBlob = (
        await crypto.databox.decryptBlob(ciphertext, nonce, ephemeralProducerPubKey)
      );

      const fileName = 'DataFrom'.concat(
        deburr(application.name).replace(/\s/g, ''),
        fileExtension,
      );
      fileDownload(decryptedBlob, fileName);
    } catch (e) {
      errorSnackBar('screens:databox.errors.default');
    }
  }

  React.useEffect(
    () => {
      if (isCryptoReadyToDecrypt) {
        setPublicKeysWeCanDecryptFrom(crypto.databox.getPublicKeysWeCanDecryptFrom());
      }
    },
    [isCryptoReadyToDecrypt],
  );
  React.useEffect(fetchDatabox, [mainDomain, isAuthenticated]);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <>
      {(isAuthenticated && !isCryptoReadyToDecrypt && !isEmpty(blobs)) && (
        <BoxMessage type="warning" my={2}>
          <Typography>{t('screens:application.box.mustUnlockVault')}</Typography>
          <MUILink
            className={classes.initCryptoLink}
            component="button"
            variant="body2"
            onClick={() => {
              initCrypto({ t, userId, setPublicKeysWeCanDecryptFrom, setIsCryptoReadyToDecrypt });
            }}
          >
            {t('screens:application.box.unlockVaultButton')}
          </MUILink>
        </BoxMessage>
      )}
      <Card
        my={3}
        title={t('screens:application.box.title')}
        primary={application && (
          <ContactButton
            dpoEmail={application.dpoEmail}
            onContributionClick={onContributionDpoEmailClick}
            applicationID={application.id}
            mainDomain={application.mainDomain}
            buttonProps={{ variant: 'outlined' }}
          >
            {t('screens:application.box.button.label')}
          </ContactButton>
        )}
      >
        {loading && <SplashScreen variant="default" />}
        {(!isNil(blobs) && blobs.length > 0)
          ? (
            <DataboxDisplay
              application={application}
              blobs={blobs}
              downloadBlob={downloadBlob}
              publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
              isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
            />
          )
          : (
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('screens:application.box.noResult')}
            </Typography>
          )}
      </Card>
      <Card
        my={3}
        title={t('screens:application.box.info.title')}
        primary={!isAuthenticated && (
          <ButtonConnectSimple buttonProps={{ variant: 'contained' }}>
            {t('screens:application.box.info.primaryButton')}
          </ButtonConnectSimple>
        )}
        secondary={!isAuthenticated && (
          <DialogConnectButton
            standing={BUTTON_STANDINGS.ENHANCED}
            text={t('screens:application.box.info.secondaryButton')}
          />
        )}
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
    </>
  );
}

ApplicationBox.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  match: PropTypes.shape({
    params: PropTypes.shape({
      mainDomain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  userId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
};

ApplicationBox.defaultProps = {
  application: null,
  userId: null,
  isAuthenticated: false,
};

export default connect(
  (state, ownProps) => ({
    application: denormalize(
      ownProps.match.params.mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
    userId: state.auth.userId,
    isAuthenticated: !!state.auth.token,
  }),
)(withTranslation(['common', 'screens'])(ApplicationBox));
