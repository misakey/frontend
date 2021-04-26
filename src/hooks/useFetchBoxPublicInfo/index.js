

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { notFound } from '@misakey/core/api/constants/errorTypes';

import { getCode } from '@misakey/core/helpers/apiError';
import isFunction from '@misakey/core/helpers/isFunction';
import { getBoxPublicBuilder } from '@misakey/core/api/helpers/builder/boxes';
import { computeInvitationHash, parseInvitationShare } from '@misakey/core/crypto/box/keySplitting';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { InvalidHash } from '@misakey/core/crypto/Errors/classes';


// HOOKS
export default (id, onSuccess) => {
  const { hash: locationHash } = useLocation();
  const handleHttpErrors = useHandleHttpErrors();

  const getBoxPublicInfo = useCallback(
    (invitationShareHash) => getBoxPublicBuilder({ id, invitationShareHash })
      .then((response) => {
        if (isFunction(onSuccess)) {
          return onSuccess(response);
        }
        return Promise.resolve(response);
      })
      .catch((e) => {
        const errorCode = getCode(e);
        // in case of not found error, it is already handled by useHandleBoxKeyShare
        if (errorCode === notFound) {
          throw new InvalidHash();
        }
        handleHttpErrors(e);
      }),
    [handleHttpErrors, id, onSuccess],
  );

  return useCallback(
    async () => {
      try {
        const { value: invitationKeyShare, type } = parseInvitationShare(locationHash.slice(1));
        const invitationShareHash = type === 'provision'
          ? null
          : computeInvitationHash(invitationKeyShare);
        return await getBoxPublicInfo(invitationShareHash);
      } catch (e) {
        const errorCode = getCode(e);
        if (errorCode === notFound) {
          throw new InvalidHash();
        }
        throw e;
      }
    },
    [locationHash, getBoxPublicInfo],
  );
};
