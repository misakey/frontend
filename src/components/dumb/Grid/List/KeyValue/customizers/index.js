import isNil from '@misakey/helpers/isNil';

import boolean from './boolean';
import color from './color';
import dateTime from './dateTime';
import email from './email';
import FQDN from './FQDN';
import image from './image';
import link from './link';
import number from './number';
import skip from './skip';
import string from './string';

export default [
  [isNil, () => ''],
  boolean,
  color,
  dateTime,
  email,
  FQDN,
  image,
  link,
  number,
  skip,
  string,
];
