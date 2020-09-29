import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { isMeLeaveEvent, isMeKickEvent } from 'helpers/boxEvent';
import { senderMatchesIdentifierValue } from 'helpers/sender';

import { useSelector } from 'react-redux';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useOnReceiveBox, useOnRemoveBox } from 'hooks/usePaginateBoxesByStatus/updates';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HOOKS
export default (activeStatus, search) => {
  const onReceiveBox = useOnReceiveBox(activeStatus, search);
  const onRemoveBox = useOnRemoveBox(activeStatus, search);

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');
  const tRef = useRef(t);

  useEffect(
    () => {
      tRef.current = t;
    },
    [tRef, t],
  );

  const leaveSuccess = useMemo(
    () => t('boxes:removeBox.success.leave'),
    [t],
  );

  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const onDeleteSuccess = useCallback(
    (box) => {
      const { lastEvent: { sender } } = box;
      if (senderMatchesIdentifierValue({ sender, identifierValue })) {
        return enqueueSnackbar(tRef.current('boxes:removeBox.success.delete', box), { variant: 'success' });
      }
      // @FIXME persist snackbar for this important info ?
      return enqueueSnackbar(tRef.current('boxes:removeBox.success.delete', box), { variant: 'warning', persist: true });
    },
    [identifierValue, enqueueSnackbar, tRef],
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
          return onReceiveBox({ ...object, isMember: false, hasAccess: false });
        }
        return onReceiveBox(object);
      }
      // @FIXME should we handle an error ?
      return Promise.resolve();
    },
    [enqueueSnackbar, identifierValue, leaveSuccess, onDeleteSuccess, onReceiveBox, onRemoveBox],
  );
};
