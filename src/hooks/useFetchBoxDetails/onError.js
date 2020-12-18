

import { useCallback } from 'react';
import { normalize } from 'normalizr';
import { useDispatch } from 'react-redux';

import errorTypes from '@misakey/ui/constants/errorTypes';

import { getCode, getDetails } from '@misakey/helpers/apiError';
import isFunction from '@misakey/helpers/isFunction';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { receiveEntities } from '@misakey/store/actions/entities';

// CONSTANTS
const { forbidden } = errorTypes;
const NOT_MEMBER = 'not_member';
const NO_ACCESS = 'no_access';

export default (id, onDefaultError = null, setLastBoxIdConfirmedNoAccess) => {
  const dispatch = useDispatch();

  const dispatchReceiveBox = useCallback(
    (data) => {
      const normalized = normalize(data, BoxesSchema.entity);
      const { entities } = normalized;
      return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
    },
    [dispatch],
  );

  return useCallback(
    async (error) => {
      const code = getCode(error);
      const { reason } = getDetails(error);
      if (code === forbidden) {
        switch (reason) {
          case NOT_MEMBER: {
            dispatchReceiveBox({ id, isMember: false, hasAccess: true });
            break;
          }
          case NO_ACCESS: {
            if (isFunction(setLastBoxIdConfirmedNoAccess)) {
              setLastBoxIdConfirmedNoAccess(id);
            }
            dispatchReceiveBox({ id, hasAccess: false });
            break;
          }
          default: {
            if (isFunction(onDefaultError)) {
              onDefaultError(error);
            }
          }
        }
      } else if (isFunction(onDefaultError)) {
        onDefaultError(error);
      }
    },
    [dispatchReceiveBox, id, onDefaultError, setLastBoxIdConfirmedNoAccess],
  );
};
