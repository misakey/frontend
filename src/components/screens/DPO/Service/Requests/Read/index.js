import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import API from '@misakey/api';
import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';
import errorTypes from 'constants/errorTypes';

import log from '@misakey/helpers/log';
import prop from '@misakey/helpers/prop';
import omit from '@misakey/helpers/omit';
import head from '@misakey/helpers/head';
import last from '@misakey/helpers/last';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { encryptBlobFile } from '@misakey/crypto/databox/crypto';

import { makeStyles } from '@material-ui/core/styles/';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import FolderIcon from '@material-ui/icons/Folder';
import CloudDoneIcon from '@material-ui/icons/CloudDone';

import Subtitle from 'components/dumb/Typography/Subtitle';
import BoxControls from 'components/dumb/Box/Controls';
import FieldFile from 'components/dumb/Form/Field/File';
import Alert from 'components/dumb/Alert';
import FormHelperText from '@material-ui/core/FormHelperText';
import SplashScreen from 'components/dumb/SplashScreen';
import Empty from 'components/dumb/Box/Empty';
import ScreenAction from 'components/dumb/Screen/Action';
import withAccessRequest from 'components/smart/withAccessRequest';
import withErrors from 'components/dumb/Form/Field/withErrors';

// CONSTANTS
const { notFound } = errorTypes;
const FIELD_NAME = 'blob';
const INTERNAL_PROPS = ['tReady', 'isAuthenticated'];
const INITIAL_VALUES = { [FIELD_NAME]: null };
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
  pubkeys: {
    list: {
      method: 'GET',
      path: '/pubkeys',
      auth: true,
    },
  },
};

// HELPERS
function getFileExtension(fileName) {
  return `.${last(fileName.split('.'))}`;
}

const databoxIdProp = prop('databoxId');
const ownerProp = prop('owner');
const handleProp = prop('handle');
const ownerEmailProp = prop('email');

const fetchPubkey = (handle, token) => API
  .use(ENDPOINTS.pubkeys.list, token)
  .build(null, null, objectToSnakeCase({ handle }))
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  blob: {
    height: 'auto',
    padding: theme.spacing(3, 0),
  },
}));

// COMPONENTS
function Blob({ id, fileExtension, createdAt }) {
  const primary = useMemo(() => id + fileExtension, [id, fileExtension]);
  const secondary = useMemo(() => moment(createdAt).format('LLL'), [createdAt]);

  return (
    <ListItem disableGutters divider alignItems="flex-start">
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

// @FIXME: refactor field file to properly integrate formik validation
let FieldBlob = ({
  className,
  displayError,
  errorKeys,
  setFieldValue,
  setFieldTouched,
  t,
}) => {
  const onChange = useCallback(
    (file) => {
      setFieldValue(FIELD_NAME, file);
      setFieldTouched(FIELD_NAME, true, false);
    },
    [setFieldValue, setFieldTouched],
  );

  return (
    <>
      <FieldFile
        accept={['*']}
        className={className}
        onChange={onChange}
      />
      {displayError && (
        <FormHelperText error={displayError}>
          {t(errorKeys)}
        </FormHelperText>
      )}
    </>
  );
};

FieldBlob.propTypes = {
  className: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  t: PropTypes.func.isRequired,
};

FieldBlob = withTranslation('fields')(withErrors(FieldBlob));

function ServiceRequestsRead({
  match: { params }, accessRequest, accessToken,
  isLoading, isFetching, error, accessRequestError,
  appBarProps, t, ...rest
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const [isFetchingDatabox] = useState(false);
  const [errorDatabox] = useState();

  const state = useMemo(
    () => ({
      error: errorDatabox || error || accessRequestError,
      isLoading: isFetchingDatabox || isLoading || isFetching,
    }),
    [error, errorDatabox, accessRequestError, isFetching, isFetchingDatabox, isLoading],
  );

  const apiToken = useMemo(
    () => {
      const { token } = accessToken;
      return isNil(token) ? undefined : token;
    },
    [accessToken],
  );

  const databoxId = useMemo(
    () => databoxIdProp(accessToken) || databoxIdProp(accessRequest) || params.databoxId,
    [accessRequest, accessToken, params.databoxId],
  );

  const owner = useMemo(
    () => ownerProp(accessToken) || ownerProp(accessRequest),
    [accessToken, accessRequest],
  );

  const handle = useMemo(
    () => handleProp(owner),
    [owner],
  );

  const ownerEmail = useMemo(
    () => ownerEmailProp(owner),
    [owner],
  );

  const [blobs, setBlobs] = useState([]);
  const [isFetchingBlobs, setFetchingBlobs] = useState(false);

  const [isUploading, setUploading] = useState(false);

  const handleUpload = useCallback((form, { setFieldError }) => {
    handleClose();
    setUploading(true);

    const blob = form[FIELD_NAME];

    fetchPubkey(handle, apiToken)
      .then((pubkeys) => {
        if (isEmpty(pubkeys)) { throw new Error(notFound); }

        const { pubkey } = head(pubkeys);

        return encryptBlobFile(blob, pubkey)
          .then(({ ciphertext, nonce, ephemeralProducerPubKey }) => {
            const formData = new FormData();
            formData.append('transaction_id', Math.floor(Math.random() * 10000000000));
            formData.append('databox_id', databoxId);
            formData.append('data_type', 'all');
            formData.append('file_extension', getFileExtension(blob.name));
            formData.append('blob', ciphertext);
            formData.append('encryption[algorithm]', 'com.misakey.nacl-box');
            formData.append('encryption[nonce]', nonce);
            formData.append('encryption[ephemeral_producer_pub_key]', ephemeralProducerPubKey);
            formData.append('encryption[owner_pub_key]', pubkey);

            return API.use(ENDPOINTS.blob.create, apiToken)
              .build(null, formData)
              .send({ contentType: null })
              .then((response) => {
                setBlobs([...blobs, objectToCamelCase(response)]);
                const text = t('screens:Service.requests.read.upload.success', response);
                enqueueSnackbar(text, { variant: 'success' });
              });
          });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setFieldError(FIELD_NAME, 'invalid');
        } else {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        }
      })
      .finally(() => { setUploading(false); });
  }, [handleClose, handle, apiToken, databoxId, blobs, t, enqueueSnackbar]);

  const fetchBlobs = useCallback(() => {
    setFetchingBlobs(true);

    const queryParams = { databox_ids: [databoxId] };

    API.use(ENDPOINTS.blobMetadata.list, apiToken)
      .build(null, null, queryParams)
      .send()
      .then((response) => { setBlobs(response.map((blob) => objectToCamelCase(blob))); })
      .catch((e) => {
        const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
        enqueueSnackbar(text, { variant: 'error' });
      })
      .finally(() => { setFetchingBlobs(false); });
  }, [setFetchingBlobs, setBlobs, t, enqueueSnackbar, databoxId, apiToken]);

  useEffect(fetchBlobs, []);

  return (
    <ScreenAction
      state={state}
      appBarProps={appBarProps}
      {...omit(rest, INTERNAL_PROPS)}
      title={t('screens:Service.requests.read.title', { ownerEmail })}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('screens:Service.requests.read.subtitle', { ownerEmail })}
        </Subtitle>
        <List>
          {isFetchingBlobs && <SplashScreen />}
          {(!isFetchingBlobs && blobs.length === 0) && <Empty />}
          {blobs.map(({ id, ...props }) => <Blob key={id} id={id} {...props} />)}
        </List>
        <Formik
          validationSchema={serviceRequestsReadValidationSchema}
          initialValues={INITIAL_VALUES}
          onSubmit={handleOpen}
        >
          {({ values, isValid, setFieldValue, setFieldTouched, ...formikBag }) => (
            <Form>
              <Alert
                open={open}
                onClose={handleClose}
                onOk={() => handleUpload(values, formikBag)}
                title={t('screens:Service.requests.read.upload.title')}
                text={t('screens:Service.requests.read.upload.text', { ownerEmail })}
              />
              <Field
                name={FIELD_NAME}
                component={FieldBlob}
                className={classes.blob}
                setFieldValue={setFieldValue}
                setFieldTouched={setFieldTouched}
              />
              <BoxControls
                mt={1}
                primary={{
                  type: 'submit',
                  isLoading: isUploading,
                  isValid,
                  text: t('common:submit'),
                }}
              />
            </Form>
          )}
        </Formik>
      </Container>
    </ScreenAction>
  );
}

ServiceRequestsRead.propTypes = {
  // withAccessRequest
  accessRequest: PropTypes.shape({
    databoxId: PropTypes.string,
    producerName: PropTypes.string,
    dpoEmail: PropTypes.string,
    ownerId: PropTypes.string,
    ownerName: PropTypes.string,
    ownerEmail: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  accessRequestError: PropTypes.instanceOf(Error),
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool.isRequired,
  // CONNECT
  accessToken: PropTypes.shape({
    token: PropTypes.string,
  }).isRequired,
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ databoxId: PropTypes.string }),
  }).isRequired,
  t: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ServiceRequestsRead.defaultProps = {
  appBarProps: null,
  accessRequestError: null,
  error: null,
  isLoading: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  accessToken: state.access.token,
});

export default withTranslation(['common', 'screens'])(connect(mapStateToProps, {})(
  withAccessRequest(
    ServiceRequestsRead,
    ({ error, ...props }) => ({ accessRequestError: error, ...props }),
  ),
));
