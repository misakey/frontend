import { useCallback } from 'react';
import { useDispatch, batch } from 'react-redux';

import { updateIdentity } from '@misakey/react/auth/store/actions/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';

import { getIdentity as getIdentityBuilder } from '@misakey/core/auth/builder/identities';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';


// HOOKS
export default () => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const onLoadIdentity = useCallback(
    (nextIdentity) => {
      const normalized = normalize(nextIdentity, IdentitySchema.entity);
      const { entities } = normalized;
      batch(() => {
        dispatch(updateIdentity(nextIdentity));
        dispatch(receiveEntities(entities));
      });
      return nextIdentity;
    },
    [dispatch],
  );

  return useCallback(
    (identityId) => getIdentityBuilder(identityId)
      .then(onLoadIdentity)
      .catch(handleHttpErrors),
    [handleHttpErrors, onLoadIdentity],
  );
};
