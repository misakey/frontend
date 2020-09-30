import { CHANGE_EVENT_TYPES } from 'constants/app/boxes/events';
import { receiveWSEditEvent, addBoxEvent } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import { isMeKickEvent } from 'helpers/boxEvent';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePaginateEventsContext } from 'components/smart/Context/PaginateEventsByBox';
import { NORMAL_CLOSE_CODE } from '@misakey/hooks/useWebSocket';
import { useHistory } from 'react-router-dom';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HOOKS
export default (boxId, addItems) => {
  // @FIXME unused for now
  const { addItems: contextAddItems } = usePaginateEventsContext();

  const dispatch = useDispatch();
  const { replace } = useHistory();

  const localOrContextAddItems = useMemo(
    () => (isFunction(addItems) ? addItems : contextAddItems),
    [addItems, contextAddItems],
  );

  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  return useCallback(
    (event, onClose) => {
      const { referrerId, type } = event;
      if (CHANGE_EVENT_TYPES.includes(type) && !isNil(referrerId)) {
        return Promise.resolve(dispatch(receiveWSEditEvent(event)));
      }
      if (isMeKickEvent(event, identifierValue)) {
        // @FIXME to handle with backend soon
        onClose(NORMAL_CLOSE_CODE);
        replace(routes.boxes._);
      }
      return Promise.resolve(dispatch(addBoxEvent(boxId, event)))
        .then(() => localOrContextAddItems([event]));
    },
    [dispatch, boxId, identifierValue, localOrContextAddItems, replace],
  );
};
