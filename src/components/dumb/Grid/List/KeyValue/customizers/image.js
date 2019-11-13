import React from 'react';
import Avatar from '@material-ui/core/Avatar';

import isImage from '@misakey/helpers/isImage';

function match(value) {
  return isImage(value);
}

function format(value, key, t) {
  return (
    <Avatar
      key={key}
      src={value}
      alt={t(`${key}.image.alt`, { value })}
      style={{ borderRadius: 0 }}
    />
  );
}

export default [match, format];
