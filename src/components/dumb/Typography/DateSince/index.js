import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import isNil from '@misakey/helpers/isNil';

import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';

import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

// COMPONENTS
const TypographyDateSince = ({ date, text }) => {
  const calendarDateSince = useCalendarDateSince(date);

  const label = useMemo(
    () => (!isNil(text) ? `${text} ${calendarDateSince}` : calendarDateSince),
    [calendarDateSince, text],
  );
  const dateFormated = useMemo(
    () => moment(date).format('lll'),
    [date],
  );

  if (isNil(date)) {
    return null;
  }

  return (
    <Tooltip title={dateFormated}>
      <Typography variant="caption">{label}</Typography>
    </Tooltip>
  );
};

TypographyDateSince.propTypes = {
  date: PropTypes.string,
  text: PropTypes.string,
};

TypographyDateSince.defaultProps = {
  date: null,
  text: null,
};

export default TypographyDateSince;
