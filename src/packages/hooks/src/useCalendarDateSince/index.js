import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

// @FIXME Should refactor that component to work with multiple language structure
// It has been designed only for french
export default (date, dateReference = null, options = {}) => {
  const { t } = useTranslation('common');

  const forcePrefix = useMemo(
    () => options.forcePrefix === true,
    [options],
  );

  const forceNoPrefix = useMemo(
    () => options.forceNoPrefix === true,
    [options],
  );

  const labelType = useMemo(
    () => (options.duration === true ? 'duration' : 'event'),
    [options],
  );

  const maxCount = useMemo(
    () => options.maxCount,
    [options],
  );

  const optionalPastPrefix = useMemo(
    () => (forcePrefix ? `${t(`common:date.since.past.${labelType}`)}` : ''),
    [forcePrefix, labelType, t],
  );
  const optionalFuturePrefix = useMemo(
    () => (forcePrefix ? `${t(`common:date.since.future.${labelType}`)}` : ''),
    [forcePrefix, labelType, t],
  );

  const pastPrefix = useMemo(
    () => (forceNoPrefix ? '' : `${t(`common:date.since.past.${labelType}`)}`),
    [forceNoPrefix, labelType, t],
  );

  const futurePrefix = useMemo(
    () => (forceNoPrefix ? '' : `${t(`common:date.since.future.${labelType}`)}`),
    [forceNoPrefix, labelType, t],
  );

  const formats = useMemo(
    () => ({
      sameDay: `[${optionalPastPrefix} ${t('common:date.calendar.sameDay')}]`,
      nextDay: `[${optionalFuturePrefix} ${t('common:date.calendar.nextDay')}]`,
      lastDay: `[${optionalPastPrefix} ${t('common:date.calendar.lastDay')}]`,
      nextWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        const countText = count > maxCount
          ? t('common:date.since.max', { count })
          : t('common:date.since.unit', { count });
        return `[${futurePrefix} ${countText}]`;
      },
      lastWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        const countText = count > maxCount
          ? t('common:date.since.max', { count })
          : t('common:date.since.unit', { count });
        return `[${pastPrefix} ${countText}]`;
      },
      sameElse(reference) {
        const difference = this.diff(reference, 'days');
        const count = Math.abs(difference);
        const countText = count > maxCount
          ? t('common:date.since.max', { count })
          : t('common:date.since.unit', { count });
        const prefix = difference > 0 ? futurePrefix : pastPrefix;
        return `[${prefix} ${countText}]`;
      },
    }),
    [optionalPastPrefix, t, optionalFuturePrefix, maxCount, pastPrefix, futurePrefix],
  );

  const dateMoment = useMemo(
    () => moment(date),
    [date],
  );

  const calendarDateSince = useMemo(
    () => dateMoment.calendar(dateReference, formats),
    [dateMoment, dateReference, formats],
  );

  return calendarDateSince;
};
