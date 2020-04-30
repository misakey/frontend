import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { useHistory, useLocation, Link } from 'react-router-dom';

import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { OPEN, DONE, CLOSED } from 'constants/databox/status';

import DataboxSchema from 'store/schemas/Databox';
import { updateDatabox, setUrlAccessRequest } from 'store/actions/databox';

import { getDetailPairsHead, getCode } from '@misakey/helpers/apiError';
import getNextSearch from '@misakey/helpers/getNextSearch';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import DialogArchiveRequest from 'components/dumb/Dialog/Databox/Archive';
import DialogReopenRequest from 'components/dumb/Dialog/Databox/Reopen';
import RequestActions from 'components/smart/Request/Actions';
import { NEW_OWNER_COMMENTS } from 'constants/databox/comment';
import { TERMINATING, ACCEPTING, REOPENING, OWNER } from 'constants/databox/event';


// CONSTANTS
const PATCH_REQUEST_ENDPOINT = {
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
const closeRequest = (id, body) => API
  .use(PATCH_REQUEST_ENDPOINT)
  .build({ id }, body)
  .send();

const reopenRequest = (id) => API
  .use(PATCH_REQUEST_ENDPOINT)
  .build({ id }, { status: OPEN })
  .send();

const getAccessRequest = (id) => API
  .use(API.endpoints.request.requestAccess)
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

const CitizenRequestReadActions = ({
  request,
  dispatchUpdateRequest,
  dispatchSetUrlAccessRequest,
  t,
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

  const { id, status, type } = useMemo(
    () => request || {},
    [request],
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
      closeRequest(id, body)
        .then(() => dispatchUpdateRequest(id, objectToCamelCase(body), TERMINATING))
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
    [id, dispatchUpdateRequest, onError, t, onDialogClose],
  );

  const onAcceptDpoReason = useCallback(
    () => {
      const body = { status: CLOSED };
      closeRequest(id, body)
        .then(() => dispatchUpdateRequest(id, objectToCamelCase(body), ACCEPTING))
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
    [dispatchUpdateRequest, id, onError, t],
  );

  const onReopenMailTo = useOnReopenMailTo(id, dispatchSetUrlAccessRequest, history, search);

  const onReopen = useCallback(
    () => {
      reopenRequest(id)
        .then(() => {
          dispatchUpdateRequest(id, { status: OPEN, dpoComment: '' }, REOPENING);
          return getAccessRequest(id)
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
    [dispatchUpdateRequest, id, onDialogClose, onError, onReopenMailTo, t],
  );

  const actions = useMemo(
    () => {
      if (status === OPEN) {
        return {
          secondary: {
            key: 'setAsClosed',
            text: t('common:archive'),
            standing: BUTTON_STANDINGS.OUTLINED,
            onClick: onArchiveDialog,
          },
          primary: {
            key: 'contactAgain',
            text: t('common:relance'),
            standing: BUTTON_STANDINGS.MAIN,
            component: Link,
            to: {
              pathname,
              search: getNextSearch(search, new Map([['recontact', true]])),
            },
          },
        };
      }

      if (status === DONE) {
        return {
          secondary: {
            key: 'reopen',
            text: t('common:reopen'),
            standing: BUTTON_STANDINGS.OUTLINED,
            onClick: onReopenDialog,
          },
          primary: {
            key: 'openMailTo',
            text: t('common:archive'),
            standing: BUTTON_STANDINGS.MAIN,
            onClick: onAcceptDpoReason,
          },
        };
      }

      return null;
    },
    [onAcceptDpoReason, onArchiveDialog, onReopenDialog, pathname, search, status, t],
  );

  if (!isNil(actions)) {
    return (
      <RequestActions actions={actions} requestType={type}>
        {/* RequestActions provide a ThemeProvider depending on requestType */}
        <DialogArchiveRequest
          open={openDialog === DIALOGS.CLOSE}
          options={NEW_OWNER_COMMENTS}
          onClose={onDialogClose}
          onSuccess={onArchive}
        />
        <DialogReopenRequest
          open={openDialog === DIALOGS.REOPEN}
          onClose={onDialogClose}
          onSuccess={onReopen}
        />
      </RequestActions>
    );
  }

  return null;
};

CitizenRequestReadActions.propTypes = {
  t: PropTypes.func.isRequired,
  request: PropTypes.shape(DataboxSchema.propTypes),

  // CONNECT
  dispatchUpdateRequest: PropTypes.func.isRequired,
  dispatchSetUrlAccessRequest: PropTypes.func.isRequired,
};

CitizenRequestReadActions.defaultProps = {
  request: null,
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatchUpdateRequest: (id, changes, action) => dispatch(
    updateDatabox(id, changes, { action, role: OWNER }),
  ),
  dispatchSetUrlAccessRequest: (id, url, search, history) => {
    Promise.resolve(dispatch(setUrlAccessRequest(id, url)))
      .then(() => history.replace({ pathname: ownProps.pathname, search }));
  },
});

export default connect(null, mapDispatchToProps)(
  withTranslation(['common', 'citizen'])(CitizenRequestReadActions),
);
