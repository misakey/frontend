import * as tweetnaclUtil from 'tweetnacl-util';

import isTypedArray from '@misakey/helpers/isTypedArray';
import isEmpty from '@misakey/helpers/isEmpty';

export function encodeBase64(data) {
  if (isEmpty(data)) { throw Error('cannot encode empty data'); }
  if (!isTypedArray(data)) {
    throw Error(`function encodeBase64 requires a Uint8Array, not ${typeof data}`);
  }

  return tweetnaclUtil.encodeBase64(data);
}

export function decodeBase64(string) {
  if (isEmpty(string)) { throw Error('cannot decode empty input'); }

  try {
    return tweetnaclUtil.decodeBase64(string);
  } catch (e) {
    if (e instanceof TypeError) {
      throw Error(`does not seem to be valid base64: ${string}`);
    }
    throw e;
  }
}
