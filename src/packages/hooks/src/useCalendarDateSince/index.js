import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

// @FIXME Should refactor that component to work with multiple language structure
// It has been designed only for french
export default (date, dateReference = null, options = {}) => {
  const { t } = useTranslation('common');

  const onlyNumberOfDays = useMemo(
    () => options.onlyNumberOfDays === true,
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

  const formats = useMemo(
    () => ({
      sameDay: onlyNumberOfDays
        ? `[${t('common:date.calendar.sameDay')}]`
        : `[${t(`common:date.calendar.past.${labelType}`, { calendarDay: t('common:date.calendar.sameDay') })}]`,
      nextDay: onlyNumberOfDays
        ? `[${t('common:date.calendar.nextDay')}]`
        : `[${t(`common:date.calendar.future.${labelType}`, { calendarDay: t('common:date.calendar.nextDay') })}]`,
      lastDay: onlyNumberOfDays
        ? `[${t('common:date.calendar.lastDay')}]`
        : `[${t(`common:date.calendar.past.${labelType}`, { calendarDay: t('common:date.calendar.lastDay') })}]`,
      nextWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        const numberOfDays = count > maxCount
          ? t('common:date.since.max', { count })
          : t('common:date.since.unit', { count });

        const translatedDate = (onlyNumberOfDays
          ? numberOfDays
          : t(`common:date.since.future.${labelType}`, { numberOfDays }));

        return `[${translatedDate}]`;
      },
      lastWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        const numberOfDays = count > maxCount
          ? t('common:date.since.max', { count })
          : t('common:date.since.unit', { count });

        const translatedDate = (onlyNumberOfDays
          ? numberOfDays
          : t(`common:date.since.past.${labelType}`, { numberOfDays }));

        return `[${translatedDate}]`;
      },
      sameElse(reference) {
        const difference = this.diff(reference, 'days');
        const count = Math.abs(difference);
        const numberOfDays = count > maxCount
          ? t('common:date.since.max', { maxCount })
          : t('common:date.since.unit', { count });

        let translatedDate;
        if (difference > 0) {
          translatedDate = (onlyNumberOfDays
            ? numberOfDays
            : t(`common:date.since.future.${labelType}`, { numberOfDays }));
        } else {
          translatedDate = (onlyNumberOfDays
            ? numberOfDays
            : t(`common:date.since.past.${labelType}`, { numberOfDays }));
        }
        return `[${translatedDate}]`;
      },
    }),
    [t, maxCount, labelType, onlyNumberOfDays],
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
