import * as tweetnaclUtil from 'tweetnacl-util';

import isTypedArray from '@misakey/helpers/isTypedArray';
import isEmpty from '@misakey/helpers/isEmpty';
import trimEnd from '@misakey/helpers/trimEnd';

export function encodeBase64(data, { urlSafe = false } = {}) {
  if (isEmpty(data)) { throw Error('cannot encode empty data'); }
  if (!isTypedArray(data)) {
    throw Error(`function encodeBase64 requires a Uint8Array, not ${typeof data}`);
  }

  const encoded = tweetnaclUtil.encodeBase64(data);
  // Unpadded URL-safe base64 (https://github.com/dchest/tweetnacl-util-js/issues/6)
  return urlSafe
    ? trimEnd(
      encoded.replace(/\//g, '_').replace(/\+/g, '-'),
      '=',
    )
    : encoded;
}

export function decodeBase64(string, { urlSafe = false } = {}) {
  if (isEmpty(string)) { throw Error('cannot decode empty input'); }

  try {
    // Unpadded URL-safe base64 (https://github.com/dchest/tweetnacl-util-js/issues/6)
    const toDecode = urlSafe ? `${string.replace(/_/g, '/').replace(/-/g, '+')}=` : string;
    return tweetnaclUtil.decodeBase64(toDecode);
  } catch (e) {
    if (e instanceof TypeError) {
      throw Error(`does not seem to be valid base64: ${string}`);
    }
    throw e;
  }
}
