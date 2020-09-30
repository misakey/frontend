import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import routes from 'routes';

import { isMeLeaveEvent, isMeKickEvent } from 'helpers/boxEvent';
import { senderIdMatchesIdentityId } from 'helpers/sender';
import path from '@misakey/helpers/path';

import { useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useOnReceiveBox, useOnRemoveBox } from 'hooks/usePaginateBoxesByStatus/updates';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import useModifier from '@misakey/hooks/useModifier';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
  identityId: IDENTITY_ID_SELECTOR,
} = authSelectors;

// HELPERS
const idParamPath = path(['params', 'id']);

// HOOKS
export default (activeStatus, search) => {
  const onReceiveBox = useOnReceiveBox(activeStatus, search);
  const onRemoveBox = useOnRemoveBox(activeStatus, search);

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');
  const tRef = useRef(t);

  const matchBoxSelected = useRouteMatch(routes.boxes.read._);
  const id = useModifier(idParamPath, matchBoxSelected);
  const idRef = useRef(id);

  const { replace } = useHistory();

  const idMatchesDeletedBoxId = useCallback(
    ({ id: boxId }) => idRef.current === boxId,
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
    () => t('boxes:removeBox.success.leave'),
    [t],
  );

  const identityId = useSelector(IDENTITY_ID_SELECTOR);
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const onDeleteSuccess = useCallback(
    (box) => {
      if (senderIdMatchesIdentityId(box, identityId)) {
        enqueueSnackbar(tRef.current('boxes:removeBox.success.delete.you', box), { variant: 'success' });
      } else {
        // @FIXME persist snackbar for this important info ?
        enqueueSnackbar(tRef.current('boxes:removeBox.success.delete.unknown', box), { variant: 'warning', persist: true });
      }
      if (idMatchesDeletedBoxId(box)) {
        return replace(routes.boxes._);
      }
      return Promise.resolve();
    },
    [identityId, enqueueSnackbar, tRef, idMatchesDeletedBoxId, replace],
  );

  const onKickSuccess = useCallback(
    (box) => enqueueSnackbar(tRef.current('boxes:removeBox.success.kick', box), { variant: 'info' }),
    [enqueueSnackbar, tRef],
  );


  return useCallback(
    ({ type, object }) => {
    // box update
      if (type === 'box.delete') {
        return onRemoveBox(object)
          .then(() => onDeleteSuccess(object));
      }
      if (type === 'box') {
        const { lastEvent } = object;
        if (isMeLeaveEvent(lastEvent, identifierValue)) {
          return onRemoveBox(object)
            .then(() => enqueueSnackbar(leaveSuccess, { variant: 'success' }));
        }
        if (isMeKickEvent(lastEvent, identifierValue)) {
          return onRemoveBox(object)
            .then(() => onKickSuccess(object));
        }
        return onReceiveBox(object);
      }
      // @FIXME should we handle an error ?
      return Promise.resolve();
    },
    [
      enqueueSnackbar,
      identifierValue,
      leaveSuccess, onDeleteSuccess, onKickSuccess, onReceiveBox, onRemoveBox,
    ],
  );
};
