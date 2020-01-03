import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';


export default (date, dateReference = null, options = {}) => {
  const { t } = useTranslation('common');

  const forcePrefix = useMemo(
    () => options.forcePrefix === true,
    [options],
  );

  const labelType = useMemo(
    () => (options.duration === true ? 'duration' : 'event'),
    [options],
  );

  const pastPrefix = useMemo(
    () => (forcePrefix ? `${t(`common:dateSince.past.${labelType}`)} ` : ''),
    [forcePrefix, labelType, t],
  );
  const futurePrefix = useMemo(
    () => (forcePrefix ? `${t(`common:dateSince.future.${labelType}`)} ` : ''),
    [forcePrefix, labelType, t],
  );

  const formats = useMemo(
    () => ({
      sameDay: `[${pastPrefix}${t('common:calendar.sameDay')}]`,
      nextDay: `[${futurePrefix}${t('common:calendar.nextDay')}]`,
      lastDay: `[${pastPrefix}${t('common:calendar.lastDay')}]`,
      nextWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        return `[${t(`common:dateSince.future.${labelType}`)} ${t('common:dateSince.unit', { count })}]`;
      },
      lastWeek(reference) {
        const count = Math.abs(this.diff(reference, 'days'));
        return `[${t(`common:dateSince.past.${labelType}`)} ${t('common:dateSince.unit', { count })}]`;
      },
      sameElse(reference) {
        const difference = this.diff(reference, 'days');
        const count = Math.abs(difference);
        const prefix = difference > 0 ? t(`common:dateSince.future.${labelType}`) : t(`common:dateSince.past.${labelType}`);
        return `[${prefix} ${t('common:dateSince.unit', { count })}]`;
      },
    }),
    [futurePrefix, labelType, pastPrefix, t],
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
