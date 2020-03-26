import React from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';

import Typography from '@material-ui/core/Typography';

// COMPONENTS
const TypographyDateSince = ({ date, text }) => {
  const calendarDateSince = useCalendarDateSince(date);

  const label = `${text} ${calendarDateSince}`;

  if (isNil(date)) {
    return null;
  }

  return <Typography variant="caption">{label}</Typography>;
};

TypographyDateSince.propTypes = {
  date: PropTypes.string,
  text: PropTypes.string.isRequired,
};

TypographyDateSince.defaultProps = {
  date: null,
};

export default TypographyDateSince;
