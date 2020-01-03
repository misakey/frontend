import { useMemo, useCallback } from 'react';

import moment from 'moment';

export const useDateFormatCallback = (format = 'LLL') => useCallback(
  (dateString) => moment(dateString).format(format),
  [format],
);

export const useDateFormatMemo = (dateString, format = 'LLL') => useMemo(
  () => moment(dateString).format(format),
  [dateString, format],
);
