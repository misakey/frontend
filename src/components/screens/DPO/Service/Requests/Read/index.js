import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import API from '@misakey/api';
// import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';
import log from '@misakey/helpers/log';
import prop from '@misakey/helpers/prop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import { producerCryptoContext as crypto } from '@misakey/crypto';

import { makeStyles } from '@material-ui/core/styles/';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import FolderIcon from '@material-ui/icons/Folder';
import CloudDoneIcon from '@material-ui/icons/CloudDone';

import Navigation from '@misakey/ui/Navigation';
import BoxSection from '@misakey/ui/Box/Section';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import FormFields from '@misakey/ui/Form/Fields';
import FieldFile from '@misakey/ui/Form/Field/File';
import Alert from '@misakey/ui/Alert';
import SplashScreen from '@misakey/ui/SplashScreen';
import Empty from 'components/dumb/Box/Empty';

const INITIAL_VALUES = { blob: null };

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(3),
  },
  blob: {
    height: 'auto',
    padding: theme.spacing(3, 0),
  },
}));

const ENDPOINTS = {
  blob: {
    create: {
      method: 'PUT',
      path: '/blobs',
      auth: true,
    },
  },
  blobMetadata: {
    list: {
      method: 'GET',
      path: '/blobs',
      auth: true,
    },
  },
  user: {
    pubKey: {
      read: {
        method: 'GET',
        path: '/users/:id/pubkey',
        auth: true,
      },
    },
  },
};

function getFileExtension(fileName) {
  if (typeof fileName !== 'string' || !fileName.includes('.')) {
    throw TypeError({ details: { file: 'invalid ' } });
  }

  return `.${fileName.split('.').slice(-1)[0]}`;
}

function Blob({ id, fileExtension, createdAt }) {
  const primary = useMemo(() => id + fileExtension, [id, fileExtension]);
  const secondary = useMemo(() => moment(createdAt).format('LLL'), [createdAt]);

  return (
    <ListItem disableGutters divider alignItemsFlexStart>
      <ListItemAvatar>
        <Avatar>
          <FolderIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={primary}
        secondary={secondary}
      />
      <ListItemSecondaryAction>
        <CloudDoneIcon />
      </ListItemSecondaryAction>
    </ListItem>
  );
}

Blob.propTypes = {
  id: PropTypes.string.isRequired,
  fileExtension: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
};

function ServiceRequestsRead({
  match: { params }, accessRequest, accessToken,
  history, showGoBack, t,
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  // TODO: get databox from next to be created endpoint
  const [databox] = useState({ ownerId: 'test' });
  const [isFetchingDatabox] = useState(false);
  const [errorDatabox] = useState();

  const [blobs, setBlobs] = useState([]);
  const [isFetchingBlobs, setFetchingBlobs] = useState(false);

  const [fieldBlob, setFieldBlob] = useState(null);
  const [isUploading, setUploading] = useState(false);

  const fields = useMemo(() => ({
    blob: {
      component: FieldFile,
      className: classes.blob,
      onChange: setFieldBlob,
    },
  }), [setFieldBlob, classes.blob]);

  const handleUpload = useCallback((values, { setErrors }) => {
    handleClose();
    setUploading(true);

    const { databoxId = params.databoxId, ownerId = databox.ownerId } = accessRequest;
    const blob = fieldBlob;

    API.use(ENDPOINTS.user.pubKey.read, accessToken.token)
      .build({ id: ownerId })
      .send()
      .then(({ pubkey }) => {
        crypto.databox.setOwnerPublicKey(ownerId, pubkey, true);
        crypto.databox.encryptBlob(blob, ownerId)
          .then(({ ciphertext, nonce, ephemeralProducerPubKey, ownerPublicKey }) => {
            const formData = new FormData();
            formData.append('transaction_id', Math.floor(Math.random() * 10000000000));
            formData.append('databox_id', databoxId);
            formData.append('data_type', 'all');
            formData.append('file_extension', getFileExtension(blob.name));
            formData.append('blob', ciphertext);
            formData.append('encryption[algorithm]', 'com.misakey.nacl-box');
            formData.append('encryption[nonce]', nonce);
            formData.append('encryption[ephemeral_producer_pub_key]', ephemeralProducerPubKey);
            formData.append('encryption[owner_pub_key]', ownerPublicKey);

            API.use(ENDPOINTS.blob.create, accessToken.token)
              .build(null, formData)
              .send({ contentType: null })
              .then((response) => {
                setBlobs([...blobs, objectToCamelCase(response)]);
                const text = t('screens:Service.Requests.Read.body.upload.success', response);
                enqueueSnackbar(text, { variant: 'success' });
              });
          });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setErrors(details);
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => { setUploading(false); });
  }, [
    fieldBlob, handleClose, setUploading, setBlobs,
    enqueueSnackbar, t, params.databoxId, blobs,
    accessRequest, accessToken.token, databox.ownerId,
  ]);

  const fetchBlobs = useCallback(() => {
    setFetchingBlobs(true);

    const queryParams = { databox_ids: [accessRequest.databoxId || params.databoxId] };

    API.use(ENDPOINTS.blobMetadata.list, accessToken.token)
      .build(null, null, queryParams)
      .send()
      .then((response) => { setBlobs(response.map((blob) => objectToCamelCase(blob))); })
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(() => { setFetchingBlobs(false); });
  }, [
    setFetchingBlobs, accessRequest, setBlobs, t,
    enqueueSnackbar, params.databoxId, accessToken.token,
  ]);

  useEffect(fetchBlobs, []);

  return (
    <section id="ServiceRequestsRead" className={classes.root}>
      <Navigation
        history={history}
        showGoBack={showGoBack}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:Service.Requests.Read.body.title', { ...databox, ...accessRequest })}
      />

      <ResponseHandlerWrapper error={errorDatabox} entity={databox} isFetching={isFetchingDatabox}>
        <Container maxWidth="md">
          <BoxSection my={3}>
            <Typography>
              {t('screens:Service.Requests.Read.body.desc', { ...databox, ...accessRequest })}
            </Typography>
            <List>
              {isFetchingBlobs && <SplashScreen />}
              {(!isFetchingBlobs && blobs.length === 0) && <Empty />}
              {blobs.map((props) => <Blob {...props} />)}
            </List>
          </BoxSection>
          <Formik
            // @fixme: WE NEED TO VALIDATE THE BLOB
            // validationSchema={serviceRequestsReadValidationSchema}
            initialValues={INITIAL_VALUES}
            onSubmit={handleOpen}
          >
            {({ values, ...formikBag }) => (
              <Form>
                <Alert
                  open={open}
                  onClose={handleClose}
                  onOk={() => handleUpload(values, formikBag)}
                  title={t('screens:Service.Requests.Read.body.upload.title', { ...databox, ...accessRequest })}
                  text={t('screens:Service.Requests.Read.body.upload.text', { ...databox, ...accessRequest })}
                />
                <FormFields
                  fields={fields}
                  prefix="serviceRequests.Read."
                  defaultFields={fields}
                />
                <Box mt={1} display="flex" justifyContent="flex-end">
                  <ButtonSubmit
                    isSubmitting={isUploading}
                    disabled={isUploading || !fieldBlob}
                  />
                </Box>
              </Form>
            )}
          </Formik>
        </Container>
      </ResponseHandlerWrapper>
    </section>
  );
}

ServiceRequestsRead.propTypes = {
  accessRequest: PropTypes.shape({
    databoxId: PropTypes.string,
    producerName: PropTypes.string,
    dpoEmail: PropTypes.string,
    ownerId: PropTypes.string,
    ownerName: PropTypes.string,
    ownerEmail: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  accessToken: PropTypes.shape({
    token: PropTypes.string,
  }).isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ databoxId: PropTypes.string }),
  }).isRequired,
  showGoBack: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

ServiceRequestsRead.defaultProps = { showGoBack: true };

export default withTranslation(['common', 'screens'])(connect(
  (state, ownProps) => ({
    accessRequest: ownProps.accessRequest || state.accessRequest,
    accessToken: state.accessToken,
  }),
)(ServiceRequestsRead));
