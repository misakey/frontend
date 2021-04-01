import isPlainObject from '@misakey/core/helpers/isPlainObject';
import log from '@misakey/core/helpers/log';
import symmetricDifference from '@misakey/core/helpers/symmetricDifference';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import mapValues from '@misakey/core/helpers/mapValues';

import {
  encodeBase64,
  decodeBase64,
} from './base64';

const EXPECTED_PRIMITIVE_TYPES = ['string', 'number'];

export const objectKeysAreExactly = (keys, object) => (
  isEmpty(symmetricDifference(Object.keys(object), keys))
);


export function prepareForJsonSerialization(x) {
  if (x instanceof Uint8Array) {
    return {
      type: 'Uint8Array',
      encoding: 'base64',
      value: encodeBase64(x, { urlSafe: false }),
    };
  }

  if (isPlainObject(x)) {
    return mapValues(x, prepareForJsonSerialization);
  }

  if (!EXPECTED_PRIMITIVE_TYPES.includes(typeof x)) {
    log(`Warning: value with unexpected type (type: ${typeof x}): value: ${x}`, 'error');
  }

  return x;
}

export function reversePrepareForJsonSerialization(x) {
  if (isPlainObject(x)) {
    if (objectKeysAreExactly(['type', 'encoding', 'value'], x)) {
      const { type, encoding, value } = x;
      if (type === 'Uint8Array' && encoding === 'base64') {
        return decodeBase64(value, { urlSafe: false });
      }
    }

    return mapValues(x, reversePrepareForJsonSerialization);
  }

  if (!EXPECTED_PRIMITIVE_TYPES.includes(typeof x)) {
    log(`Warning: value with unexpected type (type: ${typeof x}): value: ${x}`, 'error');
  }

  return x;
}

export function serializeObjectToJson(obj) {
  if (!isPlainObject(obj)) { throw Error(`not an object: ${obj}`); }

  return JSON.stringify(prepareForJsonSerialization(obj));
}

export function deserializeJsonToObject(string) {
  if (isNil(string)) { throw Error('input is nil'); }
  return reversePrepareForJsonSerialization(JSON.parse(string));
}
