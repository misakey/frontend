import * as tweetnaclUtil from 'tweetnacl-util';

import isTypedArray from '@misakey/helpers/isTypedArray';
import isEmpty from '@misakey/helpers/isEmpty';
import trimEnd from '@misakey/helpers/trimEnd';

export const makeSafeForUrl = (string) => trimEnd(string.replace(/\//g, '_').replace(/\+/g, '-'), '=');

// From https://gist.github.com/catwell/3046205
export const getFromUrlSafe = (string) => {
  const paddingLength = string.length % 4;
  const padding = (paddingLength !== 0) ? ('===').slice(0, 4 - paddingLength) : '';
  return `${string.replace(/_/g, '/').replace(/-/g, '+')}${padding}`;
};

export function encodeBase64(data, { urlSafe = true } = {}) {
  if (isEmpty(data)) { throw Error('cannot encode empty data'); }
  if (!isTypedArray(data)) {
    throw Error(`function encodeBase64 requires a Uint8Array, not ${typeof data}`);
  }

  const encoded = tweetnaclUtil.encodeBase64(data);
  // Unpadded URL-safe base64 (https://github.com/dchest/tweetnacl-util-js/issues/6)
  return urlSafe ? makeSafeForUrl(encoded) : encoded;
}

export function decodeBase64(string, { urlSafe = true } = {}) {
  if (isEmpty(string)) { throw Error('cannot decode empty input'); }

  try {
    // Unpadded URL-safe base64 (https://github.com/dchest/tweetnacl-util-js/issues/6)
    const toDecode = urlSafe ? getFromUrlSafe(string) : string;
    return tweetnaclUtil.decodeBase64(toDecode);
  } catch (e) {
    if (e instanceof TypeError) {
      throw Error(`does not seem to be valid base64: ${string}`);
    }
    throw e;
  }
}

export const isUnpaddedUrlSafeBase64 = (string) => !(/[+/=]/).test(string);
