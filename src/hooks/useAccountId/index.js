import { useMemo } from 'react';

import { MISAKEY_ACCOUNT_ID } from 'constants/account';

export default (identity, fallback = true) => {
  const { accountId } = useMemo(() => identity || {}, [identity]);

  return useMemo(
    () => (fallback
      ? accountId || MISAKEY_ACCOUNT_ID
      : accountId
    ),
    [accountId, fallback],
  );
};
