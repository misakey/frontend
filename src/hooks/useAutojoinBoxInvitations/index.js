import { markNotificationAsUsed } from 'store/actions/identity/notifications';
import processAutoInviteCryptoaction from '@misakey/react/crypto/store/actions/processAutoInviteCryptoaction';

import isArray from '@misakey/core/helpers/isArray';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isFunction from '@misakey/core/helpers/isFunction';
import { bulkJoinBoxes } from '@misakey/core/api/helpers/builder/identities';

import { useCallback } from 'react';
import { useDispatch, batch } from 'react-redux';

// HOOKS
export default (identityId, onJoining = null) => {
  const dispatch = useDispatch();

  return useCallback(
    async (invitationOrInvitations) => {
      const boxInvitations = isArray(invitationOrInvitations)
        ? invitationOrInvitations
        : [invitationOrInvitations];
      return batch(
        async () => {
          const boxIds = await Promise.all(boxInvitations
            .map(async ({ id, details: invitationDetails }) => {
              const boxId = await dispatch(
                processAutoInviteCryptoaction(invitationDetails),
              );
              // NB: if notification is not in store, nothing happens
              await dispatch(markNotificationAsUsed(id));
              return boxId;
            }));
          if (!isEmpty(boxIds)) {
            if (isFunction(onJoining)) {
              onJoining(boxIds);
            }
            return bulkJoinBoxes(identityId, boxIds);
          }
          return Promise.resolve();
        },
      );
    },
    [dispatch, identityId, onJoining],
  );
};
