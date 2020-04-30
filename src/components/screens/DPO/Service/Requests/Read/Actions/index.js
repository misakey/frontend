import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { generatePath } from 'react-router-dom';
import routes from 'routes';

import errorTypes from '@misakey/ui/constants/errorTypes';
import API from '@misakey/api';
import { getDetailPairsHead } from '@misakey/helpers/apiError';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import isNil from '@misakey/helpers/isNil';

import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';

import { OPEN, DONE, CLOSED } from 'constants/databox/status';

import Typography from '@material-ui/core/Typography';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import DialogDataboxDone from 'components/dumb/Dialog/Databox/Done';
import DataboxSchema from 'store/schemas/Databox';
import DpoRequestReadUploadDialog from 'components/screens/DPO/Service/Requests/Read/Actions/UploadModal';
import RequestActions from 'components/smart/Request/Actions';

import { ERASURE } from 'constants/databox/type';
import { connect } from 'react-redux';
import { updateDatabox } from 'store/actions/databox';
import { ANSWERING, UPLOADING, DPO } from 'constants/databox/event';
import encodeMailto from 'helpers/encodeMailto';
import { normalize } from 'normalizr';
import BlobSchema from 'store/schemas/Databox/Blob';

import useMailtoProps from 'hooks/useMailtoProps';

// CONSTANTS
const DIALOGS = {
  DONE: 'DONE',
  UPLOAD: 'UPLOAD',
};
const { forbidden, conflict } = errorTypes;

// HELPERS
const setDataboxDone = (id, body) => API
  .use(API.endpoints.request.update)
  .build({ id }, objectToSnakeCase(body))
  .send();

const DpoRequestReadActions = ({ request, dispatchUpdateRequest, dispatchReceiveBlob, t }) => {
  const [openedDialog, setOpenedDialog] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const { id, owner, status, type, dpoComment } = useMemo(() => request || {}, [request]);
  const { displayName: ownerName, email: ownerEmail } = useMemo(() => owner || {}, [owner]);
  const isErasure = useMemo(() => type === ERASURE, [type]);

  const onClose = useCallback(() => { setOpenedDialog(null); }, []);
  const openUploadModal = useCallback(() => { setOpenedDialog(DIALOGS.UPLOAD); }, []);
  const openDoneModal = useCallback(() => { setOpenedDialog(DIALOGS.DONE); }, []);

  const onDone = useCallback(
    (form, { setSubmitting }) => {
      const body = { status: DONE, ...form };
      setDataboxDone(id, body)
        .then(() => {
          const text = (
            <Typography>
              {t('dpo:requests.read.done.success', { ownerName })}
              &nbsp;&#x1F642;
            </Typography>
          );
          enqueueSnackbar(text, { variant: 'success' });
          return dispatchUpdateRequest(id, body, ANSWERING);
        })
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return enqueueSnackbar(t('common:httpStatus.error.403', { variant: 'error' }));
          }
          const [, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return enqueueSnackbar(t('dpo:requests.read.done.error', { variant: 'error' }));
          }
          return enqueueSnackbar(t('common:httpStatus.error.default', { variant: 'error' }));
        })
        .finally(() => {
          setSubmitting(false);
          onClose();
        });
    },
    [dispatchUpdateRequest, enqueueSnackbar, id, onClose, ownerName, t],
  );

  const onUploading = useCallback(
    (blob) => Promise.all([
      dispatchReceiveBlob(blob),
      dispatchUpdateRequest(id, {}, UPLOADING, { blobId: blob.id }),
    ]),
    [dispatchReceiveBlob, dispatchUpdateRequest, id],
  );

  const requestCitizenUrl = useMemo(
    () => parseUrlFromLocation(generatePath(routes.citizen.requests.read, { id })).href,
    [id],
  );

  const setAsDoneButtonProps = useMemo(
    () => ({
      key: 'setAsDone',
      text: t('dpo:requests.read.actions.setAsDone'),
      standing: BUTTON_STANDINGS.OUTLINED,
      onClick: openDoneModal,
    }),
    [openDoneModal, t],
  );

  const openEncryptModalButtonProps = useMemo(
    () => ({
      key: 'openEncryptModal',
      text: t('dpo:requests.read.actions.encrypt'),
      standing: BUTTON_STANDINGS.MAIN,
      onClick: openUploadModal,
    }),
    [openUploadModal, t],
  );

  const mailtoForDone = useMemo(
    () => encodeMailto(
      ownerEmail,
      t(`dpo:requests.read.actions.mailto.answering.${dpoComment}.subject`),
      t(`dpo:requests.read.actions.mailto.answering.${dpoComment}.body`, { requestUrl: requestCitizenUrl }),
    ),
    [dpoComment, ownerEmail, requestCitizenUrl, t],
  );

  const mailtoPropsForDone = useMailtoProps(mailtoForDone);


  const mailtoForClosed = useMemo(
    () => encodeMailto(
      ownerEmail,
      t('dpo:requests.read.actions.mailto.closed.subject'),
      t('dpo:requests.read.actions.mailto.closed.body', { requestUrl: requestCitizenUrl }),
    ),
    [ownerEmail, requestCitizenUrl, t],
  );

  const mailtoPropsForClosed = useMailtoProps(mailtoForClosed);

  const openMailToForDoneStatus = useMemo(
    () => ({
      key: 'openMailToForDone',
      text: t('dpo:requests.read.actions.contact', { ownerName }),
      standing: BUTTON_STANDINGS.MAIN,
      ...mailtoPropsForDone,
    }),
    [mailtoPropsForDone, ownerName, t],
  );


  const openMailToForClosedStatus = useMemo(
    () => ({
      key: 'openMailToForClosed',
      text: t('dpo:requests.read.actions.contact', { ownerName }),
      standing: BUTTON_STANDINGS.MAIN,
      ...mailtoPropsForClosed,
    }),
    [mailtoPropsForClosed, ownerName, t],
  );

  const actions = useMemo(
    () => {
      if (status === OPEN) {
        if (!isErasure) {
          return {
            secondary: setAsDoneButtonProps,
            primary: openEncryptModalButtonProps,
          };
        }
        return [setAsDoneButtonProps];
      }

      if (status === DONE) {
        return { primary: openMailToForDoneStatus };
      }

      if (status === CLOSED) {
        return { primary: openMailToForClosedStatus };
      }

      return null;
    }, [
      isErasure, status,
      openEncryptModalButtonProps, openMailToForClosedStatus,
      openMailToForDoneStatus, setAsDoneButtonProps,
    ],
  );

  if (!isNil(actions)) {
    return (
      <RequestActions actions={actions} requestType={type}>
        {/* RequestActions provide a ThemeProvider depending on requestType */}
        <DialogDataboxDone
          open={openedDialog === DIALOGS.DONE}
          onClose={onClose}
          onSuccess={onDone}
        />
        <DpoRequestReadUploadDialog
          request={request}
          open={openedDialog === DIALOGS.UPLOAD}
          onSuccess={onUploading}
          onClose={onClose}
        />
      </RequestActions>
    );
  }

  return null;
};


DpoRequestReadActions.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  dispatchUpdateRequest: PropTypes.func.isRequired,
  dispatchReceiveBlob: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateRequest: (databoxId, changes, eventAction, metadata) => dispatch(
    updateDatabox(databoxId, changes, { action: eventAction, role: DPO, metadata }),
  ),
  dispatchReceiveBlob: (blob) => {
    const normalized = normalize(
      blob,
      BlobSchema.entity,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
  },
});

export default withTranslation('dpo')(connect(null, mapDispatchToProps)(DpoRequestReadActions));
