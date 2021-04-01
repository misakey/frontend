import isEmpty from 'lodash/isEmpty';

import isBoolean from '../isBoolean';
import isNumber from '../isNumber';

export default (value) => (isBoolean(value) || isNumber(value) ? false : isEmpty(value));
