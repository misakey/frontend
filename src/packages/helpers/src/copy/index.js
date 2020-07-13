import copy from 'copy-to-clipboard';

import isEmpty from '@misakey/helpers/isEmpty';

const HAS_CLIPBOARD = navigator.clipboard;

export default (text, options = {}) => (HAS_CLIPBOARD && isEmpty(options)
  ? navigator.clipboard.writeText(text)
  : Promise.resolve(copy(text, options)));
