import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import API from '@misakey/api';
import DataboxSchema from 'store/schemas/Databox';
import { updateDatabox } from 'store/actions/databox';

import { serviceRequestsReadValidationSchema } from 'constants/validationSchemas/dpo';
import errorTypes from 'constants/errorTypes';
import { OPEN, DONE } from 'constants/databox/status';

import log from '@misakey/helpers/log';
import prop from '@misakey/helpers/prop';
import omit from '@misakey/helpers/omit';
import head from '@misakey/helpers/head';
import last from '@misakey/helpers/last';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isArray from '@misakey/helpers/isArray';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { getDetailPairsHead } from 'helpers/apiError';

import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

import { encryptBlobFile } from '@misakey/crypto/databox/crypto';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { makeStyles } from '@material-ui/core/styles/';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link/Link';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import FolderIcon from '@material-ui/icons/Folder';
import CloudDoneIcon from '@material-ui/icons/CloudDone';

import BoxMessage from 'components/dumb/Box/Message';
import FieldFile from 'components/dumb/Form/Field/File';
import Alert from 'components/dumb/Alert';
import FormHelperText from '@material-ui/core/FormHelperText';
import Empty from 'components/dumb/Box/Empty';
import ScreenAction from 'components/dumb/Screen/Action';
import withAccessRequest from 'components/smart/withAccessRequest';
import withErrors from 'components/dumb/Form/Field/withErrors';
import ListQuestions, { useQuestionsItems } from 'components/dumb/List/Questions';
import Card from 'components/dumb/Card';
import DialogDataboxDone from 'components/dumb/Dialog/Databox/Done';
import ChipDataboxStatus from 'components/dumb/Chip/Databox/Status';

import MailIcon from '@material-ui/icons/Mail';

// CONSTANTS
const QUESTIONS_TRANS_KEY = 'screens:Service.requests.read.questions';
const { notFound, forbidden, conflict } = errorTypes;
const FIELD_NAME = 'blob';
const INTERNAL_PROPS = ['tReady', 'isAuthenticated'];
const INITIAL_VALUES = { [FIELD_NAME]: null };

const DIALOGS = {
  DONE: 'DONE',
  ALERT: 'ALERT',
};

const ENDPOINTS = {
  databox: {
    read: {
      method: 'GET',
      path: '/databoxes/:id',
      auth: true,
    },
    update: {
      method: 'PATCH',
      path: '/databoxes/:id',
      auth: true,
    },
  },
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
const ownerNameProp = prop('displayName');
const statusProp = prop('status');

const fetchPubkey = (handle) => API
  .use(ENDPOINTS.pubkeys.list)
  .build(null, null, objectToSnakeCase({ handle }))
  .send();

const fetchDatabox = (id) => API
  .use(ENDPOINTS.databox.read)
  .build(objectToSnakeCase({ id }))
  .send();

const setDataboxDone = (id, body) => API
  .use(ENDPOINTS.databox.update)
  .build({ id }, objectToSnakeCase(body))
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  blob: {
    height: 'auto',
    padding: theme.spacing(3, 0),
  },
  mkAgentLink: {
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
    color: 'inherit',
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
  ...rest
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
        {...rest}
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
  match: { params }, location: { hash },
  accessRequest, databox, dispatchReceiveDatabox,
  dispatchUpdateDatabox,
  isLoading, isFetching, error, accessRequestError,
  appBarProps, t, ...rest
}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const questionItems = useQuestionsItems(t, QUESTIONS_TRANS_KEY, 3);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();


  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const navigationProps = useMemo(
    () => ({ noWrap: true }),
    [],
  );

  // dialogs
  const [openDialog, setOpenDialog] = useState(null);
  const handleOpen = useCallback(() => {
    setOpenDialog(DIALOGS.ALERT);
  }, []);

  const onDialogClose = useCallback(() => {
    setOpenDialog(null);
  }, []);

  const [isFetchingDatabox, setIsFetchingDatabox] = useState(false);
  const [errorDatabox, setErrorDatabox] = useState();
  const [isFetchingBlobs, setFetchingBlobs] = useState(false);

  const state = useMemo(
    () => ({
      error: errorDatabox || error || accessRequestError,
      isLoading: isFetchingDatabox || isLoading || isFetching || isFetchingBlobs,
    }),
    [
      errorDatabox, error, accessRequestError,
      isFetchingDatabox, isLoading, isFetching,
      isFetchingBlobs,
    ],
  );

  const hashToken = useMemo(
    () => (!isEmpty(hash) ? hash.substr(1) : null),
    [hash],
  );

  const databoxId = useMemo(
    () => databoxIdProp(accessRequest) || params.databoxId,
    [accessRequest, params.databoxId],
  );

  const owner = useMemo(
    () => ownerProp(accessRequest),
    [accessRequest],
  );

  const handle = useMemo(
    () => handleProp(owner),
    [owner],
  );

  const ownerEmail = useMemo(
    () => ownerEmailProp(owner),
    [owner],
  );

  const ownerName = useMemo(
    () => ownerNameProp(owner),
    [owner],
  );

  const [blobs, setBlobs] = useState(null);

  const [isUploading, setUploading] = useState(false);

  const idMatches = useMemo(
    () => {
      if (!isNil(hashToken)) {
        return accessRequest.token === hashToken;
      }
      if (!isNil(params.databoxId)) {
        return accessRequest.databoxId === params.databoxId;
      }
      return false;
    },
    [hashToken, accessRequest, params.databoxId],
  );

  const requestTitle = t('screens:Service.requests.read.request.title');

  const requestTitleWithMetadata = useMemo(
    () => (
      <Grid spacing={1} container>
        <Grid item sm={7} xs={12}>
          {requestTitle}
        </Grid>
        <Grid container item xs justify={isXs ? 'center' : 'flex-end'}>
          {databox && (
            <ChipDataboxStatus databox={databox} showIcon showDetails />
          )}
        </Grid>
      </Grid>
    ),
    [requestTitle, databox, isXs],
  );

  const status = useMemo(
    () => statusProp(databox),
    [databox],
  );

  const isArchived = useMemo(
    () => (isNil(status) && !isFetchingDatabox) || status !== OPEN,
    [status, isFetchingDatabox],
  );

  const shouldFetch = useMemo(
    () => !isFetchingBlobs && idMatches && !isArchived && isNil(blobs),
    [isFetchingBlobs, idMatches, isArchived, blobs],
  );

  const shouldFetchDatabox = useMemo(
    () => idMatches && isNil(status) && isNil(databox),
    [databox, idMatches, status],
  );

  const getDatabox = useCallback(
    () => {
      setIsFetchingDatabox(true);
      fetchDatabox(databoxId)
        .then((response) => {
          dispatchReceiveDatabox(objectToCamelCase(response));
        })
        .catch(setErrorDatabox)
        .finally(() => { setIsFetchingDatabox(false); });
    },
    [databoxId, dispatchReceiveDatabox],
  );

  const handleUpload = useCallback((form, { setFieldError, resetForm }) => {
    onDialogClose();
    setUploading(true);

    const blob = form[FIELD_NAME];

    fetchPubkey(handle)
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

            return API.use(ENDPOINTS.blob.create)
              .build(null, formData)
              .send({ contentType: null })
              .then((response) => {
                const nextBlobs = (isArray(blobs) ? blobs : []).concat(objectToCamelCase(response));
                setBlobs(nextBlobs);
                const text = t('screens:Service.requests.read.upload.success', response);
                enqueueSnackbar(text, { variant: 'success' });
                resetForm(INITIAL_VALUES);
              });
          });
      })
      .catch((e) => {
        log(e);
        const details = prop('details')(e);
        if (details) {
          setFieldError(FIELD_NAME, 'invalid');
        } else {
          handleGenericHttpErrors(e);
        }
      })
      .finally(() => { setUploading(false); });
  }, [onDialogClose, handle, databoxId, blobs, t, enqueueSnackbar, handleGenericHttpErrors]);

  const getOnReset = useCallback(
    ({ resetForm }) => () => {
      resetForm(INITIAL_VALUES);
    },
    [],
  );

  const onDoneDialog = useCallback(
    () => {
      setOpenDialog(DIALOGS.DONE);
    },
    [setOpenDialog],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onDone = useCallback(
    (form, { setSubmitting }) => {
      const body = { status: DONE, ...form };
      setDataboxDone(databoxId, body)
        .then(() => dispatchUpdateDatabox(databoxId, body))
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t(`common:databox.errors.${code}`));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`common:databox.errors.conflict.done.${key}`));
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

  const fetchBlobs = useCallback(() => {
    setFetchingBlobs(true);

    const queryParams = { databox_ids: [databoxId] };

    API.use(ENDPOINTS.blobMetadata.list)
      .build(null, null, queryParams)
      .send()
      .then((response) => { setBlobs(response.map((blob) => objectToCamelCase(blob))); })
      .catch(handleGenericHttpErrors)
      .finally(() => { setFetchingBlobs(false); });
  }, [setFetchingBlobs, setBlobs, databoxId, handleGenericHttpErrors]);

  useEffect(
    () => {
      // fetch databox if missing or conditions not fulfilled in withAccessRequest
      if (shouldFetchDatabox) {
        getDatabox();
      }
    },
    [getDatabox, shouldFetchDatabox],
  );

  useEffect(
    () => {
      // fetch databox if missing or conditions not fulfilled in withAccessRequest
      if (shouldFetchDatabox) {
        getDatabox();
      }
    },
    [getDatabox, shouldFetchDatabox],
  );

  useEffect(
    () => {
      if (shouldFetch) {
        fetchBlobs();
      }
    },
    [fetchBlobs, shouldFetch],
  );

  return (
    <ScreenAction
      state={state}
      appBarProps={appBarProps}
      {...omit(rest, INTERNAL_PROPS)}
      title={t('screens:Service.requests.read.title', { ownerName })}
      navigationProps={navigationProps}
    >
      <Container maxWidth="md">
        {isArchived
          ? (
            <>
              <BoxMessage type="warning" mt={2}>
                <Typography>
                  {t('screens:Service.requests.read.archived')}
                </Typography>
              </BoxMessage>
              <Card
                my={3}
                title={requestTitleWithMetadata}
                dense
              >
                <List dense disablePadding aria-label={t('screens:Service.requests.read.request.title')}>
                  <ListItem>
                    <ListItemIcon>
                      <MailIcon />
                    </ListItemIcon>
                    <ListItemText primary={ownerEmail} />
                  </ListItem>
                </List>
              </Card>
            </>
          ) : (
            <>
              <DialogDataboxDone
                open={openDialog === DIALOGS.DONE}
                onClose={onDialogClose}
                onSuccess={onDone}
              />
              <Formik
                validationSchema={serviceRequestsReadValidationSchema}
                initialValues={INITIAL_VALUES}
                onSubmit={handleOpen}
              >
                {({ values, isValid, dirty, setFieldValue, setFieldTouched, ...formikBag }) => (
                  <Form>
                    <Card
                      my={3}
                      title={requestTitleWithMetadata}
                      primary={{
                        disabled: dirty,
                        onClick: onDoneDialog,
                        text: t('screens:Service.requests.read.vault.done'),
                      }}
                      dense
                    >
                      <List dense disablePadding aria-label={t('screens:Service.requests.read.request.title')}>
                        <ListItem>
                          <ListItemIcon>
                            <MailIcon />
                          </ListItemIcon>
                          <ListItemText primary={ownerEmail} />
                        </ListItem>
                      </List>
                    </Card>
                    <Card
                      my={3}
                      title={t('screens:Service.requests.read.vault.title')}
                      primary={{
                        type: 'submit',
                        isLoading: isUploading,
                        isValid,
                        text: t('common:submit'),
                      }}
                      secondary={{
                        text: t('common:cancel'),
                        disabled: !dirty,
                        onClick: getOnReset(formikBag),
                      }}
                    >
                      <List>
                        {(!isFetchingBlobs && isEmpty(blobs)) && <Empty />}
                        {!isEmpty(blobs)
                          && blobs.map(({ id, ...props }) => <Blob key={id} id={id} {...props} />)}
                      </List>
                      <Alert
                        open={openDialog === DIALOGS.ALERT}
                        onClose={onDialogClose}
                        onOk={() => handleUpload(values, formikBag)}
                        title={t('screens:Service.requests.read.upload.dialog.title')}
                        text={t('screens:Service.requests.read.upload.dialog.text', { ownerEmail })}
                      />
                      <Field
                        name={FIELD_NAME}
                        component={FieldBlob}
                        className={classes.blob}
                        setFieldValue={setFieldValue}
                        setFieldTouched={setFieldTouched}
                      />
                    </Card>
                  </Form>
                )}
              </Formik>
            </>
          )}
        {!isEmpty(blobs) && (
          <BoxMessage type="info" mt={2}>
            <Typography>
              {t('screens:Service.requests.read.mkAgent.message')}
              <MUILink
                className={classes.mkAgentLink}
                variant="body2"
                href={`mailto:question.pro@misakey.com?subject=${t('screens:Service.requests.read.mkAgent.mailToSubject')}`}
              >
                {t('screens:Service.requests.read.mkAgent.link')}
              </MUILink>
            </Typography>
          </BoxMessage>
        )}
        <Card
          my={3}
          title={t('screens:Service.requests.read.questions.title')}
          subtitle={(
            <MUILink
              target="_blank"
              rel="nooppener noreferrer"
              href={t('links.docs.dpo')}
            >
              {t('screens:Service.requests.read.questions.subtitle')}
            </MUILink>
          )}
        >
          <ListQuestions items={questionItems} breakpoints={{ xs: 12 }} />
        </Card>
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
  databox: PropTypes.shape(DataboxSchema.propTypes),
  dispatchReceiveDatabox: PropTypes.func.isRequired,
  accessRequestError: PropTypes.instanceOf(Error),

  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool.isRequired,
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  // CONNECT
  dispatchUpdateDatabox: PropTypes.func.isRequired,

  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ databoxId: PropTypes.string }),
  }).isRequired,
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ServiceRequestsRead.defaultProps = {
  appBarProps: null,
  accessRequestError: null,
  databox: null,
  error: null,
  isLoading: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateDatabox: (databoxId, changes) => dispatch(updateDatabox(databoxId, changes)),
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(
  withAccessRequest(
    ServiceRequestsRead,
    ({ error, ...props }) => ({ accessRequestError: error, ...props }),
  ),
));
