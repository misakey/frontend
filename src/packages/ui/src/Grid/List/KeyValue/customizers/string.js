import React from 'react';
import isString from '@misakey/helpers/isString';
import LongText from '@misakey/ui/LongText';

function match(value) {
  return isString(value);
}

function format(value, key) {
  return (
    <LongText variant="body2" key={key}>
      {value}
    </LongText>
  );
}

export default [match, format];
