import React from 'react';
import isFQDN from '@misakey/helpers/isFQDN';
import Typography from '@material-ui/core/Typography';

function match(value) {
  return isFQDN(value);
}

function format(value, key) {
  return (
    <Typography variant="body2" key={key}>
      {value}
    </Typography>
  );
}

export default [match, format];
