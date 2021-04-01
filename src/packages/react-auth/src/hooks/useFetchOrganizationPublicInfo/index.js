

import { useCallback } from 'react';


import { getOrgPublicBuilder } from '@misakey/core/api/helpers/builder/organizations';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import OrganizationsSchema from '@misakey/react-auth/store/schemas/Organizations';

import { useDispatch } from 'react-redux';
import { normalize } from 'normalizr';

import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import isFunction from '@misakey/core/helpers/isFunction';

// HOOKS
export default (onError) => {
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  return useCallback(
    (id) => getOrgPublicBuilder(id)
      .then((response) => {
        const { entities } = normalize(response, OrganizationsSchema.entity);
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
        return response;
      })
      .catch(isFunction(onError) ? onError : handleHttpErrors),
    [dispatch, handleHttpErrors, onError],
  );
};
