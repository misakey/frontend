import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { useHistory, useLocation, generatePath } from 'react-router-dom';

import API from '@misakey/api';
import routes from 'routes';
import errorTypes from 'constants/errorTypes';
import { OPEN, DONE, CLOSED } from 'constants/databox/status';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import { updateDatabox } from 'store/actions/databox';
import { contactDataboxURL } from 'store/actions/screens/contact';

import { ownerCryptoContext as crypto } from '@misakey/crypto';
import fileDownload from 'js-file-download';
import { NoPassword } from 'constants/Errors/classes';

import deburr from '@misakey/helpers/deburr';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import { getDetailPairsHead } from 'helpers/apiError';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import omitTranslationProps from 'helpers/omit/translationProps';
import getNextSearch from 'helpers/getNextSearch';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ContactButton from 'components/smart/ContactButton';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import Card from 'components/dumb/Card';
import ChipDataboxStatus from 'components/dumb/Chip/Databox/Status';
import ChipDataboxBlobs from 'components/dumb/Chip/Databox/Blobs';
import ScreenError from 'components/dumb/Screen/Error';
import SplashScreen from 'components/dumb/SplashScreen';
import DialogDataboxArchive from 'components/dumb/Dialog/Databox/Archive';
import DialogDataboxReopen from 'components/dumb/Dialog/Databox/Reopen';
import DataboxDisplay from './Display';

// CONSTANTS
const PATCH_DATABOX_ENDPOINT = {
  method: 'PATCH',
  path: '/databoxes/:id',
  auth: true,
};

const DIALOGS = {
  ARCHIVE: 'ARCHIVE',
  REOPEN: 'REOPEN',
};

const { forbidden, conflict } = errorTypes;

// HELPERS
const getStatus = prop('status');

const readBlob = async (id, onError) => {
  try {
    return (
      await API.use(API.endpoints.application.box.blob.read)
        .build({ id })
        .send()
    );
  } catch (e) {
    onError('screens:databox.errors.getBlob');
    return {};
  }
};

const downloadBlob = async (blobMetadata, application, onAskPassword, onError) => {
  try {
    const { fileExtension, id } = blobMetadata;
    const {
      nonce,
      ephemeral_producer_pub_key: ephemeralProducerPubKey,
    } = blobMetadata.encryption;

    if (!crypto.databox.isReadyToDecrypt()) {
      try {
        await onAskPassword();
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
      onError('screens:databox.errors.default');
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
    onError('screens:databox.errors.default');
  }
};

const fetchBlobs = (id) => API
  .use(API.endpoints.application.box.blob.find)
  .build(undefined, undefined, { databox_ids: [id] })
  .send();

const closeDatabox = (id, body) => API
  .use(PATCH_DATABOX_ENDPOINT)
  .build({ id }, body)
  .send();

const reopenDatabox = (id) => API
  .use(PATCH_DATABOX_ENDPOINT)
  .build({ id }, { status: OPEN })
  .send();

const requestDataboxAccess = (id) => API
  .use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const idProp = prop('id');

// HOOKS
const useOnReopenMailTo = (mainDomain, dispatchContact, history, search) => useCallback(
  (token) => {
    const databoxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
    const nextSearch = getNextSearch(search, new Map([['reopen', true]]));
    dispatchContact(databoxURL, mainDomain, nextSearch, history);
  },
  [mainDomain, dispatchContact, history, search],
);

// COMPONENTS
const CardDatabox = ({
  application,
  databox,
  title,
  publicKeysWeCanDecryptFrom,
  isCryptoReadyToDecrypt,
  onAskPassword,
  onContributionDpoEmailClick,
  isAuthenticated,
  dispatchUpdateDatabox,
  dispatchContact,
  t,
  ...props
}) => {
  const [blobs, setBlobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // dialogs
  const [openDialog, setOpenDialog] = useState(null);

  const history = useHistory();
  const { search } = useLocation();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const onArchiveDialog = useCallback(
    () => {
      setOpenDialog(DIALOGS.CLOSE);
    },
    [setOpenDialog],
  );

  const onReopenDialog = useCallback(
    () => {
      setOpenDialog(DIALOGS.REOPEN);
    },
    [setOpenDialog],
  );

  const onDialogClose = useCallback(
    () => {
      setOpenDialog(null);
    },
    [setOpenDialog],
  );

  const { enqueueSnackbar } = useSnackbar();

  const { name, dpoEmail, id, mainDomain } = useMemo(
    () => application || {},
    [application],
  );

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const resend = useMemo(
    () => !isNil(blobs),
    [blobs],
  );

  const status = useMemo(
    () => getStatus(databox),
    [databox],
  );

  const titleWithMetadata = useMemo(
    () => (
      <Grid container>
        <Grid item sm={databox ? 6 : 12} xs={12}>
          {title}
        </Grid>
        {databox && (
          <Grid spacing={1} container item xs justify={isXs ? 'center' : 'flex-end'}>
            <Grid item>
              <ChipDataboxBlobs blobs={blobs} />
            </Grid>
            <Grid item>
              <ChipDataboxStatus databox={databox} showIcon showDetails />
            </Grid>
          </Grid>
        )}
      </Grid>
    ),
    [title, blobs, databox, isXs],
  );

  const subtitle = useMemo(
    () => (isNil(blobs)
      ? null
      : t('common:databox.intro', { applicationName: name })),
    [blobs, t, name],
  );

  const blobsEmptyText = useMemo(
    () => (status === OPEN
      ? t('common:databox.empty.open', { applicationName: name })
      : t('common:databox.empty.notOpen')),
    [status, name, t],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onArchive = useCallback(
    (form, { setSubmitting }) => {
      const body = { status: CLOSED, ...objectToSnakeCase(form) };
      closeDatabox(databoxId, body)
        .then(() => dispatchUpdateDatabox(databoxId, objectToCamelCase(body)))
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t(`common:databox.errors.${code}`));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`common:databox.errors.conflict.archive.${key}`));
          }
          return onError(t('common:httpStatus.error.default'));
        })
        .finally(() => {
          setSubmitting(false);
          onDialogClose();
        });
    },
    [databoxId, dispatchUpdateDatabox, onError, t, onDialogClose],
  );

  const onReopenMailTo = useOnReopenMailTo(mainDomain, dispatchContact, history, search);

  const onReopen = useCallback(
    () => {
      reopenDatabox(databoxId)
        .then(() => {
          dispatchUpdateDatabox(databoxId, { status: OPEN });
          return requestDataboxAccess(databoxId)
            .then((response) => onReopenMailTo(response.token));
        })
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t(`common:databox.errors.${code}`));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`common:databox.errors.conflict.reopen.${key}`));
          }
          return onError(t('common:httpStatus.error.default'));
        })
        .finally(() => {
          onDialogClose();
        });
    },
    [databoxId, dispatchUpdateDatabox, onDialogClose, onError, onReopenMailTo, t],
  );

  const primary = useMemo(
    () => {
      if (isNil(status)) {
        return (
          <ContactButton
            dpoEmail={dpoEmail}
            onContributionClick={onContributionDpoEmailClick}
            applicationID={id}
            mainDomain={mainDomain}
            buttonProps={{ standing: BUTTON_STANDINGS.MAJOR }}
          >
            {t(`common:databox.button.label.${resend ? 'resend' : 'send'}`)}
          </ContactButton>
        );
      }
      if (status !== CLOSED) {
        return {
          onClick: onArchiveDialog,
          text: t('common:databox.button.label.close'),
        };
      }
      return null;
    },
    [dpoEmail, id, mainDomain, onArchiveDialog, onContributionDpoEmailClick, resend, status, t],
  );

  const secondary = useMemo(
    () => {
      if (isNil(application) || isNil(status)) { return null; }
      if (status === DONE) {
        return {
          onClick: onReopenDialog,
          text: t('common:databox.button.label.reopen'),
        };
      }
      if (status !== CLOSED) {
        return (
          <ContactButton
            dpoEmail={dpoEmail}
            onContributionClick={onContributionDpoEmailClick}
            applicationID={id}
            mainDomain={mainDomain}
            buttonProps={{ standing: BUTTON_STANDINGS.MINOR }}
          >
            {t(`common:databox.button.label.${resend ? 'resend' : 'send'}`)}
          </ContactButton>
        );
      }
      return null;
    },
    [
      application,
      status,
      onReopenDialog,
      t,
      dpoEmail,
      onContributionDpoEmailClick,
      id,
      mainDomain,
      resend,
    ],
  );

  const shouldFetch = useMemo(
    () => !isNil(databoxId) && isNil(blobs) && !loading,
    [databoxId, blobs, loading],
  );

  const onDownload = useCallback(
    (blob) => downloadBlob(blob, application, onAskPassword, onError),
    [application, onAskPassword, onError],
  );

  const getBlobs = useCallback(
    () => {
      setLoading(true);
      fetchBlobs(databox.id)
        .then((response) => setBlobs(response.map(objectToCamelCase)))
        .catch(({ httpStatus }) => setError(httpStatus))
        .finally(() => setLoading(false));
    },
    [databox, setLoading, setError, setBlobs],
  );

  useEffect(
    () => {
      if (shouldFetch) {
        getBlobs();
      }
    },
    [getBlobs, shouldFetch],
  );

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <>
      <DialogDataboxArchive
        open={openDialog === DIALOGS.CLOSE}
        onClose={onDialogClose}
        onSuccess={onArchive}
      />
      <DialogDataboxReopen
        open={openDialog === DIALOGS.REOPEN}
        onClose={onDialogClose}
        onSuccess={onReopen}
      />
      <Card
        title={titleWithMetadata}
        subtitle={subtitle}
        primary={primary}
        secondary={secondary}
        {...omitTranslationProps(props)}
      >
        {loading && <SplashScreen variant="default" />}
        {isAuthenticated && !isNil(blobs) ? (
          <>
            {isEmpty(blobs) ? (
              <Typography>
                {blobsEmptyText}
              </Typography>
            ) : (
              <DataboxDisplay
                blobs={blobs}
                downloadBlob={onDownload}
                publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
                isCryptoReadyToDecrypt={isCryptoReadyToDecrypt}
              />
            )}
          </>
        ) : (
          <Typography>{ t('common:databox.noResult') }</Typography>
        )}
      </Card>
    </>
  );
};

CardDatabox.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  title: PropTypes.node,
  publicKeysWeCanDecryptFrom: PropTypes.arrayOf(PropTypes.string).isRequired,
  isCryptoReadyToDecrypt: PropTypes.bool.isRequired,
  onAskPassword: PropTypes.func.isRequired,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  // CONNECT
  isAuthenticated: PropTypes.bool,
  dispatchUpdateDatabox: PropTypes.func.isRequired,
  dispatchContact: PropTypes.func.isRequired,
};

CardDatabox.defaultProps = {
  application: null,
  databox: null,
  title: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateDatabox: (databoxId, changes) => dispatch(updateDatabox(databoxId, changes)),
  dispatchContact: (databoxURL, mainDomain, search, history) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = generatePath(
      routes.citizen.application.contact.preview,
      { mainDomain },
    );
    history.push({ pathname, search });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['common'])(CardDatabox));
