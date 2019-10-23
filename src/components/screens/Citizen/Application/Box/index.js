import React from 'react';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { denormalize } from 'normalizr';
import fileDownload from 'js-file-download';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import API from '@misakey/api';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import deburr from '@misakey/helpers/deburr';
import parseJwt from '@misakey/helpers/parseJwt';
import isObject from '@misakey/helpers/isObject';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import SplashScreen from '@misakey/ui/SplashScreen';
import ScreenError from 'components/dumb/Screen/Error';

import DataboxDisplay from 'components/screens/Citizen/Application/Box/DataboxDisplay';

import BoxSection from '@misakey/ui/Box/Section';
import ContactButton from 'components/smart/ContactButton';
import { makeStyles } from '@material-ui/core/styles';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import { BackupDecryptionError } from '@misakey/crypto/Errors/classes';

import { NoPassword } from 'constants/Errors/classes';

const useStyles = makeStyles((theme) => ({
  boxSection: {
    position: 'relative',
  },
  titleWithButton: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  contactButton: {
    marginLeft: theme.spacing(1),
  },
}));

function ApplicationBox({ application, match, t, auth }) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  const [databox, setDatabox] = React.useState(null);
  const [blobs, setBlobs] = React.useState(null);

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

  function fetchDatabox() {
    setError(false);
    setLoading(true);

    API.use(API.endpoints.application.box.find)
      .build()
      .send()
      .then((databoxes) => databoxes.forEach(({ producer_id: producerId, id }) => {
        if (producerId === application.id) {
          fetchBlobs(id);
          setDatabox(id);
        }
      }))
      .catch(({ httpStatus }) => setError(httpStatus))
      .finally(() => setLoading(false));
  }

  function promptForPassword(previousAttemptFailed = false) {
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

  async function initCrypto() {
    const promisedPassword = promptForPassword();

    const userId = parseJwt(auth.id).sub;
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
  }

  async function readBlob(id) {
    try {
      return (
        await API.use(API.endpoints.application.box.blob.read)
          .build({ id })
          .send()
      );
    } catch (e) {
      errorSnackBar('screens:databox.errors.getBlob');
      return null;
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
          await initCrypto();
        } catch (e) {
          if (e instanceof NoPassword) {
            // do nothing
            return;
          }
          throw e;
        }
      }

      const { blob: ciphertext } = await readBlob(id);

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

  React.useEffect(fetchDatabox, [mainDomain]);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <section id="ApplicationBox">
      <Container maxWidth={false}>
        <BoxSection my={3} className={classes.boxSection}>
          {loading && <SplashScreen variant="default" />}
          {isObject(application) && (
            <>
              <Typography variant="h6" component="h5" className={classes.titleWithButton}>
                {t('screens:application.nav.personalData')}
                {databox && (
                  <ContactButton
                    className={classes.contactButton}
                    idToken={auth.id}
                    dpoEmail={application.dpoEmail}
                    applicationID={application.id}
                    mainDomain={application.mainDomain}
                    contactedView={!!databox}
                  />
                )}
              </Typography>
              {!blobs && (
                <Typography>
                  {t('screens:application.box.noResult', { name: application.name })}
                </Typography>
              )}
              {!!blobs && (
                <DataboxDisplay
                  application={application}
                  blobs={blobs}
                  downloadBlob={downloadBlob}
                />
              )}
            </>
          )}
        </BoxSection>
      </Container>
    </section>
  );
}

ApplicationBox.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mainDomain: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default connect(
  (state, ownProps) => ({
    application: denormalize(
      ownProps.match.params.mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
    auth: state.auth,
  }),
)(withTranslation(['common', 'screens'])(ApplicationBox));
