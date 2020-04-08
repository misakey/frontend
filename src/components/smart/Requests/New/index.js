import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { normalize } from 'normalizr';
import { useDispatch } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { addToAllRequestIdsForStatus } from 'store/actions/screens/allRequestIds';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import UserEmailSchema from 'store/schemas/UserEmail';

import API from '@misakey/api';
import errorTypes from '@misakey/ui/constants/errorTypes';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import { getFirstUserEmailId } from 'helpers/userEmail';
import { getCode, getDetails } from '@misakey/helpers/apiError';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import withUserEmails from 'components/smart/withUserEmails';
import DataboxSchema from 'store/schemas/Databox';

// CONSTANTS
const { conflict } = errorTypes;

// HELPERS
const postRequest = (payload) => API.use(API.endpoints.application.box.create)
  .build(null, objectToSnakeCase(payload))
  .send();

// COMPONENTS
// @FIXME transform into a hook as it is not a real component anymore
// @TODO: rework (dependency on) withUserEmails
const NewRequest = ({
  children,
  userEmails,
  userId,
  producerId,
  type,
  onCreateSuccess,
  onCreateError,
  t,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const userEmailId = useMemo(() => getFirstUserEmailId(userEmails), [userEmails]);
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const dispatch = useDispatch();

  const createRequest = useCallback(
    () => {
      const requiredParams = { ownerId: userId, producerId, userEmailId };
      return postRequest(isNil(type) ? requiredParams : { ...requiredParams, type });
    },
    [producerId, type, userEmailId, userId],
  );

  const onSuccess = useCallback((createdRequest) => {
    const newRequest = objectToCamelCase(createdRequest);
    const { id, status } = newRequest;
    const normalized = normalize(
      newRequest,
      DataboxSchema.entity,
    );
    const { entities } = normalized;
    return Promise.all([
      dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
      dispatch(addToAllRequestIdsForStatus(id, status)),
    ]).then(() => {
      onCreateSuccess(newRequest);
    });
  }, [dispatch, onCreateSuccess]);


  const onError = useCallback(
    (e) => {
      const code = getCode(e);
      const { status } = getDetails(e);
      if (code === conflict && status === conflict) {
        return enqueueSnackbar(t('citizen:requests.read.errors.conflict.open.status'), { variant: 'error' });
      }
      if (isFunction(onCreateError)) {
        onCreateError(e);
      }

      return handleGenericHttpErrors(e);
    }, [enqueueSnackbar, handleGenericHttpErrors, onCreateError, t],
  );

  const shouldFetch = useMemo(
    () => !isNil(userEmailId) && !isNil(producerId),
    [producerId, userEmailId],
  );

  useFetchEffect(
    createRequest,
    { shouldFetch, fetchOnlyOnce: true },
    { onSuccess, onError },
  );

  return children;
};


NewRequest.propTypes = {
  // withUserEmails
  userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  userId: PropTypes.string,
  // props
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  producerId: PropTypes.string.isRequired,
  type: PropTypes.string,
  onCreateSuccess: PropTypes.func,
  onCreateError: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

NewRequest.defaultProps = {
  children: null,
  userId: null,
  userEmails: null,
  onCreateSuccess: null,
  onCreateError: null,
  type: null,
};

export default withUserEmails(withTranslation('citizen')(NewRequest));
