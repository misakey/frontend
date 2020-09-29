import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities } from '@misakey/store/actions/entities';

import { updateBoxCount } from '@misakey/helpers/builder/boxes';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

// @UNUSED
export default () => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const dispatchResetBoxCount = useCallback(
    (id) => Promise.resolve(
      dispatch(updateEntities([{ id, changes: { eventsCount: 0 } }], BoxesSchema)),
    ),
    [dispatch],
  );

  return useCallback(
    ({ boxId, identityId }) => updateBoxCount({ id: boxId, identityId })
      .then(() => dispatchResetBoxCount(boxId))
      .catch(handleHttpErrors),
    [dispatchResetBoxCount, handleHttpErrors],
  );
};
