import React from 'react';
import isBoolean from '@misakey/helpers/isBoolean';
import Typography from '@material-ui/core/Typography';

function match(value) {
  return isBoolean(value);
}

function format(value, key, t) {
  return (
    <Typography variant="body2" key={key}>
      {t(`boolean.${value}`, value.toString())}
    </Typography>
  );
}

export default [match, format];
