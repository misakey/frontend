import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { useHistory, useLocation, Link } from 'react-router-dom';
import moment from 'moment';

import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { OPEN, DONE, CLOSED } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import { updateDatabox, setUrlAccessRequest } from 'store/actions/databox';

import { getDetailPairsHead, getCode } from '@misakey/helpers/apiError';
import getNextSearch from '@misakey/helpers/getNextSearch';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import DialogDataboxArchive from 'components/dumb/Dialog/Databox/Archive';
import DialogDataboxReopen from 'components/dumb/Dialog/Databox/Reopen';
import Card from 'components/dumb/Card';
import CardSimpleDoubleButton from 'components/dumb/Card/Simple/DoubleButton';
import CardSimpleDoubleTextDoubleButton from 'components/dumb/Card/Simple/DoubleTextDoubleButton';
import DataboxContent from 'components/smart/Databox/Content';
import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import { Box, Typography } from '@material-ui/core';
import { NEW_OWNER_COMMENTS } from 'constants/databox/comment';


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

// HOOKS
const useOnReopenMailTo = (id, dispatchSetUrlAccessRequest, history, search) => useCallback(
  (token) => {
    const nextSearch = getNextSearch(search, new Map([['reopen', true]]));
    dispatchSetUrlAccessRequest(id, token, nextSearch, history);
  },
  [search, dispatchSetUrlAccessRequest, id, history],
);

const CurrentDatabox = ({
  application,
  databox,
  isAuthenticated,
  dispatchUpdateDatabox,
  dispatchSetUrlAccessRequest,
  initCrypto,
  t,
  ...rest
}) => {
  // dialogs
  const [openDialog, setOpenDialog] = useState(null);

  const history = useHistory();
  const { search, pathname } = useLocation();

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

  const { id: databoxId, status, type, dpoComment, sentAt, updatedAt, owner } = useMemo(
    () => databox || {},
    [databox],
  );

  const { email: ownerEmail } = useMemo(
    () => owner || {},
    [owner],
  );

  const openSince = useMemo(
    () => moment(sentAt).fromNow(),
    [sentAt],
  );

  const durationOfTheRequest = useMemo(
    () => moment(updatedAt).to(sentAt, true),
    [sentAt, updatedAt],
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
          const code = getCode(err);
          if (code === forbidden) {
            return onError(t('common:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen:requests.read.errors.conflict.archive.${key}`));
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

  const onAcceptDpoReason = useCallback(
    () => {
      const body = { status: CLOSED };
      closeDatabox(databoxId, body)
        .then(() => dispatchUpdateDatabox(databoxId, objectToCamelCase(body)))
        .catch((err) => {
          const code = getCode(err);
          if (code === forbidden) {
            return onError(t('common:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen:requests.read.errors.conflict.archive.${key}`));
          }
          return onError(t('common:httpStatus.error.default'));
        });
    },
    [databoxId, dispatchUpdateDatabox, onError, t],
  );

  const onReopenMailTo = useOnReopenMailTo(databoxId, dispatchSetUrlAccessRequest, history, search);

  const onReopen = useCallback(
    () => {
      reopenDatabox(databoxId)
        .then(() => {
          dispatchUpdateDatabox(databoxId, { status: OPEN, dpoComment: '' });
          return requestDataboxAccess(databoxId)
            .then((response) => onReopenMailTo(response.token));
        })
        .catch((err) => {
          const code = getCode(err);
          if (code === forbidden) {
            return onError(t('common:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen:requests.read.errors.conflict.reopen.${key}`));
          }
          return onError(t('common:httpStatus.error.default'));
        })
        .finally(() => {
          onDialogClose();
        });
    },
    [databoxId, dispatchUpdateDatabox, onDialogClose, onError, onReopenMailTo, t],
  );

  const dpoHasAnswered = useMemo(
    () => !isNil(dpoComment) && !isEmpty(dpoComment),
    [dpoComment],
  );

  const isUserActionAllowed = useMemo(
    () => status !== CLOSED,
    [status],
  );

  // It can exist a dpo answer but on status not closed (reopening request)
  const waitingForAnwser = useMemo(
    () => (isNil(dpoComment) || ![DONE, CLOSED].includes(status)),
    [dpoComment, status],
  );

  const primaryWaitingForAnswer = useMemo(
    () => ((status !== DONE) ? {
      standing: BUTTON_STANDINGS.MAIN,
      text: t('common:resendEmail'),
      size: 'small',
      component: Link,
      to: {
        pathname,
        search: getNextSearch(search, new Map([['recontact', true]])),
      },
    } : null),
    [pathname, search, status, t],
  );

  const secondaryWaitingForAnswer = useMemo(
    () => ((status !== DONE) ? {
      standing: BUTTON_STANDINGS.CANCEL,
      text: t('common:archive'),
      onClick: onArchiveDialog,
      size: 'small',
    } : null),
    [onArchiveDialog, status, t],
  );

  const primaryDpoHasAnswered = useMemo(
    () => (isUserActionAllowed ? {
      standing: BUTTON_STANDINGS.MAIN,
      text: t('common:archive'),
      onClick: onAcceptDpoReason,
      size: 'small',
    } : null),
    [isUserActionAllowed, onAcceptDpoReason, t],
  );

  const secondaryDpoHasAnswered = useMemo(
    () => (isUserActionAllowed ? {
      standing: BUTTON_STANDINGS.CANCEL,
      text: t('common:reopen'),
      onClick: onReopenDialog,
      size: 'small',
    } : null),
    [isUserActionAllowed, onReopenDialog, t],
  );

  return (
    <div {...omitTranslationProps(rest)}>
      <DialogDataboxArchive
        open={openDialog === DIALOGS.CLOSE}
        options={NEW_OWNER_COMMENTS}
        onClose={onDialogClose}
        onSuccess={onArchive}
      />
      <DialogDataboxReopen
        open={openDialog === DIALOGS.REOPEN}
        onClose={onDialogClose}
        onSuccess={onReopen}
      />
      <Card>
        <Box py={1.5} px={2} display="flex" alignItems="center">
          <RequestTypeAvatar type={type} />
          <Typography>{t('citizen:requests.read.from.label', { ownerEmail })}</Typography>
        </Box>
      </Card>
      <DataboxContent
        databox={databox}
        application={application}
        initCrypto={initCrypto}
      />
      {waitingForAnwser && (
        <CardSimpleDoubleButton
          my={2}
          text={t('citizen:requests.read.current.openSince', { since: openSince })}
          primary={primaryWaitingForAnswer}
          secondary={secondaryWaitingForAnswer}
        />
      )}
      {dpoHasAnswered && (
        <CardSimpleDoubleTextDoubleButton
          my={2}
          highlight={isUserActionAllowed}
          primaryText={t('citizen:requests.read.closed.by.dpo')}
          secondaryText={
            t(
              'citizen:requests.read.closed.subtitle',
              {
                status: t(`common:databox.dpoComment.${databox.dpoComment}`),
                duration: durationOfTheRequest,
              },
            )
          }
          secondary={secondaryDpoHasAnswered}
          primary={primaryDpoHasAnswered}
        />
      )}
    </div>
  );
};

CurrentDatabox.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  initCrypto: PropTypes.func.isRequired,

  // CONNECT
  isAuthenticated: PropTypes.bool,
  dispatchUpdateDatabox: PropTypes.func.isRequired,
  dispatchSetUrlAccessRequest: PropTypes.func.isRequired,
};

CurrentDatabox.defaultProps = {
  application: null,
  databox: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatchUpdateDatabox: (databoxId, changes) => dispatch(updateDatabox(databoxId, changes)),
  dispatchSetUrlAccessRequest: (id, url, search, history) => {
    Promise.resolve(dispatch(setUrlAccessRequest(id, url)))
      .then(() => history.replace({ pathname: ownProps.pathname, search }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common', 'citizen'])(CurrentDatabox),
);
