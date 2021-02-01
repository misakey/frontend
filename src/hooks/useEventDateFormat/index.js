import { DATETIME_EXTRA_SHORT, TIME } from '@misakey/ui/constants/formats/dates';

import moment from 'moment';

import { useMemo } from 'react';

export default (dateRef, dateRelative) => {
  const momentRelative = useMemo(
    () => moment(dateRelative),
    [dateRelative],
  );

  const isSameDay = useMemo(
    () => momentRelative.isSame(dateRef, 'day'),
    [momentRelative, dateRef],
  );

  return useMemo(
    () => (isSameDay
      ? momentRelative.format(TIME)
      : momentRelative.format(DATETIME_EXTRA_SHORT)),
    [momentRelative, isSameDay],
  );
};
