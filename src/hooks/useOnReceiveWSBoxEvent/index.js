import { CHANGE_EVENT_TYPES, MEMBER_KICK } from 'constants/app/boxes/events';
import { receiveWSEditEvent, addBoxEvent } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import { eventKickedMemberIdentifierValuePath } from 'helpers/boxEvent';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePaginateEventsContext } from 'components/smart/Context/PaginateEventsByBox';
import { NORMAL_CLOSE_CODE } from '@misakey/hooks/useWebSocket';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HOOKS
export default (boxId, addItems) => {
  // @FIXME unused for now
  const { addItems: contextAddItems } = usePaginateEventsContext();

  const dispatch = useDispatch();

  const localOrContextAddItems = useMemo(
    () => (isFunction(addItems) ? addItems : contextAddItems),
    [addItems, contextAddItems],
  );

  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  return useCallback(
    (event, onClose) => {
      const { referrerId, type, content } = event;
      if (CHANGE_EVENT_TYPES.includes(type) && !isNil(referrerId)) {
        return Promise.resolve(dispatch(receiveWSEditEvent(event)));
      }
      if (type === MEMBER_KICK) {
        const kickedMemberIdentifierValue = eventKickedMemberIdentifierValuePath(content);
        if (kickedMemberIdentifierValue === identifierValue) {
          // @FIXME to handle with backend soon
          onClose(NORMAL_CLOSE_CODE);
        }
      }
      return Promise.resolve(dispatch(addBoxEvent(boxId, event)))
        .then(() => localOrContextAddItems([event]));
    },
    [dispatch, boxId, identifierValue, localOrContextAddItems],
  );
};
