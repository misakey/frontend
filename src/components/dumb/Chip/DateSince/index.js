import React from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';

import Chip from '@material-ui/core/Chip';

// COMPONENTS
const ChipDateSince = ({ date, text, ...rest }) => {
  const calendarDateSince = useCalendarDateSince(date, null, { forcePrefix: true, duration: true });

  const label = `${text} ${calendarDateSince}`;

  if (isNil(date)) {
    return null;
  }

  return <Chip color="secondary" variant="outlined" {...rest} label={label} />;
};

ChipDateSince.propTypes = {
  date: PropTypes.string,
  text: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

ChipDateSince.defaultProps = {
  date: null,
};

export default ChipDateSince;
