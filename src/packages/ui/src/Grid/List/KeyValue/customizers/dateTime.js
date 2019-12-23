import React from 'react';
import moment from 'moment';
import isDate from '@misakey/helpers/isDate';
import Typography from '@material-ui/core/Typography';

function match(value) {
  return isDate(value);
}

function format(value, key) {
  return (
    <Typography variant="body2" key={key}>
      {moment(value).format('LLL')}
    </Typography>
  );
}

export default [match, format];
