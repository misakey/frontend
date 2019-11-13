import React from 'react';
import Link from '@material-ui/core/Link';
import LongText from 'components/dumb/LongText';
import isURL from '@misakey/helpers/isURL';

function match(value) {
  return isURL(value);
}

function format(value, key, t, text) {
  return (
    <LongText variant="body2" key={key}>
      <Link
        href={value}
        rel="noopener noreferrer"
        target="_blank"
      >
        {text || value}
      </Link>
    </LongText>
  );
}

export default [match, format];
