import React from 'react';
import numeral from 'numeral';
import isNumber from '@misakey/helpers/isNumber';

import Typography from '@material-ui/core/Typography';

function match(value) {
  return isNumber(value);
}

function format(value, key) {
  return (
    <Typography variant="body2" key={key}>
      {numeral(value).format('0,0')}
    </Typography>
  );
}

export default [match, format];
