import routes from 'routes';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';
import BoxesSchema from 'store/schemas/Boxes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { DELETED_BOX, NEW_EVENT, NOTIFICATIONS_ACK, BOX_SETTINGS, NOTIFICATION, SAVED_FILE } from 'constants/app/boxes/ws/messageTypes';
import { BOX_AUTO_INVITE } from 'constants/app/notifications/byIdentity';
import { CHANGE_EVENT_TYPES } from '@misakey/core/api/constants/boxes/events';
import { receiveWSEditEvent, addBoxEvent } from 'store/reducers/box';
import { updateEntities } from '@misakey/store/actions/entities';
import { addNewNotification } from 'store/actions/identity/notifications';

import { isMeLeaveEvent, isMeKickEvent, isMeJoinEvent, isMeEvent } from '@misakey/ui/helpers/boxEvent';
import path from '@misakey/core/helpers/path';
import isNil from '@misakey/core/helpers/isNil';
import log from '@misakey/core/helpers/log';

import { useSelector, useDispatch, batch } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useOnRemoveBox } from 'hooks/usePaginateBoxesByStatus/updates';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import useModifier from '@misakey/hooks/useModifier';
import useOnNotifyEvent from 'hooks/useOnNotifyEvent';
import useGeneratePathKeepingSearchAndHashCallback from '@misakey/hooks/useGeneratePathKeepingSearchAndHash/callback';
import useAutojoinBoxInvitations from 'hooks/useAutojoinBoxInvitations';

// CONSTANTS
const {
  identityId: IDENTITY_ID_SELECTOR,
} = authSelectors;

// HELPERS
const idParamPath = path(['params', 'id']);

// HOOKS
export default (filterId, search) => {
  const onRemoveBox = useOnRemoveBox(search);
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');
  const tRef = useRef(t);

  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const id = useModifier(idParamPath, matchBoxSelected);
  const idRef = useRef(id);

  const generatePath = useGeneratePathKeepingSearchAndHashCallback();
  const { replace } = useHistory();

  const idRefMatchesDeletedBoxId = useCallback(
    (boxId) => idRef.current === boxId,
    [idRef],
  );

  useEffect(
    () => {
      tRef.current = t;
      idRef.current = id;
    },
    [tRef, t, idRef, id],
  );

  const leaveSuccess = useMemo(
    () => tRef.current('boxes:removeBox.success.leave'),
    [tRef],
  );

  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const autojoinBoxInvitations = useAutojoinBoxInvitations(identityId);

  const onDelete = useCallback(
    ({ boxId }) => {
      if (idRefMatchesDeletedBoxId(boxId)) {
        replace(generatePath(routes.boxes._, undefined, undefined, ''));
      }
      return onRemoveBox(filterId, boxId);
    },
    [idRefMatchesDeletedBoxId, onRemoveBox, filterId, replace, generatePath],
  );

  const onDeleteSuccess = useCallback(
    (box) => {
      const { title, senderId } = box;
      if (senderId === identityId) {
        enqueueSnackbar(tRef.current('boxes:removeBox.success.delete.you'), { variant: 'success' });
      } else if (!isNil(title)) {
        // This information will be handled by user notifications later
        enqueueSnackbar(
          tRef.current('boxes:removeBox.success.delete.they', { title }),
          { variant: 'warning', persist: true },
        );
      }
      return Promise.resolve();
    },
    [identityId, enqueueSnackbar, tRef],
  );

  const onNotifyEvent = useOnNotifyEvent();

  return useCallback(
    ({ type, object }) => {
      // delete box
      if (type === DELETED_BOX) {
        const { id: boxId, ...rest } = object;
        return onDelete({ boxId, ...rest }).then((box) => onDeleteSuccess({ ...box, ...object }));
      }

      if (type === BOX_SETTINGS) {
        const { boxId } = object;
        return Promise.resolve(
          dispatch(updateEntities([{ id: boxId, changes: { settings: object } }], BoxesSchema)),
        );
      }

      if (type === NOTIFICATIONS_ACK) {
        const { boxId } = object;
        return Promise.resolve(
          dispatch(updateEntities([{ id: boxId, changes: { eventsCount: 0 } }], BoxesSchema)),
        );
      }

      if (type === NOTIFICATION) {
        const { type: notifType } = object;
        if (notifType === BOX_AUTO_INVITE) {
          autojoinBoxInvitations(object);
        }
        return Promise.resolve(dispatch(addNewNotification(object)));
      }

      if (type === SAVED_FILE) {
        const { encryptedFileId, isSaved } = object;
        return Promise.resolve(
          dispatch(updateEntities(
            [{ id: encryptedFileId, changes: { isSaved } }],
            DecryptedFileSchema,
          )),
        );
      }

      // New event
      if (type === NEW_EVENT) {
        const { referrerId, type: eventType, boxId } = object;
        if (CHANGE_EVENT_TYPES.includes(eventType) && !isNil(referrerId)) {
          return Promise.resolve(dispatch(receiveWSEditEvent(object)));
        }
        if (isMeLeaveEvent(object, identityId)) {
          return onDelete(object).then(() => enqueueSnackbar(leaveSuccess, { variant: 'success' }));
        }
        if (isMeKickEvent(object, identityId)) {
          return onDelete(object);
        }
        if (isMeJoinEvent(object, identityId)) {
          return batch(() => {
            dispatch(updateEntities(
              [{ id: boxId, changes: { hasAccess: true, isMember: true } }],
              BoxesSchema,
            ));
            dispatch(addBoxEvent(boxId, object, true, filterId, onNotifyEvent));
          });
        }
        const isMyEvent = isMeEvent(object, identityId);
        return Promise.resolve(
          dispatch(addBoxEvent(boxId, object, isMyEvent, filterId, onNotifyEvent)),
        );
      }
      log(`Receive unknown WS type: ${type}`);
      return Promise.resolve();
    },
    [
      onDelete, onDeleteSuccess, onNotifyEvent, dispatch, autojoinBoxInvitations,
      identityId, filterId, enqueueSnackbar, leaveSuccess,
    ],
  );
};
