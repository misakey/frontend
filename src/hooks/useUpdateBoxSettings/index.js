import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import { updateBoxSettings } from '@misakey/core/api/helpers/builder/identities';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

export default (boxId, muted) => {
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const onToggleMuted = useCallback(
    () => updateBoxSettings(identityId, boxId, { muted }),
    [boxId, identityId, muted],
  );

  return useFetchCallback(onToggleMuted);
};
