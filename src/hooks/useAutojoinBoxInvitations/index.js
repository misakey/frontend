import { markNotificationAsUsed } from 'store/actions/identity/notifications';
import processAutoInviteCryptoaction from '@misakey/react/crypto/store/actions/processAutoInviteCryptoaction';
import { DecryptionKeyNotFound } from '@misakey/core/crypto/Errors/classes';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';

import isArray from '@misakey/core/helpers/isArray';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isSelfOrg from 'helpers/isSelfOrg';
import compact from '@misakey/core/helpers/compact';
import isFunction from '@misakey/core/helpers/isFunction';
import { bulkJoinBoxes } from '@misakey/core/api/helpers/builder/identities';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import useFetchOrganizationsCallback from 'hooks/useFetchOrganizations/callback';

// CONSTANTS
const { makeGetOrganizations } = orgSelectors;

// HOOKS
export default (identityId, onJoining = null) => {
  const dispatch = useDispatch();

  const getOrganizationsSelector = useMemo(
    () => makeGetOrganizations(),
    [],
  );
  const organizationIds = useSelector((state) => getOrganizationsSelector(state, identityId));
  const fetchUserOrganizations = useFetchOrganizationsCallback(identityId);

  return useCallback(
    async (invitationOrInvitations) => {
      const boxInvitations = isArray(invitationOrInvitations)
        ? invitationOrInvitations
        : [invitationOrInvitations];

      return batch(
        async () => {
          // @FIXME: remove if org list is refreshed in websocket
          let refetchOrgsNeeded = false;
          // `compact` removes `null` values
          // corresponding to cryptoactions we could not process
          const boxIds = compact(
            await Promise.all(
              boxInvitations.map(async ({ id, details: invitationDetails }) => {
                try {
                  const boxId = await dispatch(
                    processAutoInviteCryptoaction(invitationDetails),
                  );
                  // NB: if notification is not in store, nothing happens
                  await dispatch(markNotificationAsUsed(id));
                  const { ownerOrgId } = invitationDetails;
                  if (!isNil(ownerOrgId)
                  && !organizationIds.includes(ownerOrgId)
                  && !isSelfOrg(ownerOrgId)) {
                    refetchOrgsNeeded = true;
                  }
                  return boxId;
                } catch (error) {
                  if (error instanceof DecryptionKeyNotFound) {
                    // will be removed by `compact` (see above)
                    return null;
                  }
                  throw error;
                }
              }),
            ),
          );

          if (isEmpty(boxIds)) {
            return;
          }

          if (isFunction(onJoining)) {
            onJoining(boxIds);
          }
          await bulkJoinBoxes(identityId, boxIds);
          if (refetchOrgsNeeded) {
            await fetchUserOrganizations();
          }
        },
      );
    },
    [dispatch, fetchUserOrganizations, identityId, onJoining, organizationIds],
  );
};
