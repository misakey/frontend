import isBase64 from '@misakey/helpers/isBase64';

/**
 * A helper that applies a heuristic to decide whether a string
 * is likely to be a base64 value or not.
 * Helper "isBase64" only tells you if it *can* interpreted as a base64 value
 * (it checks the valdity of the format), not if it *should* be interpreted as a base64 value.
 * For instance "requestPayload", "FooBar" and even "box_id" are all valid base64 values
 * but they are probably *not meant* to be interpreted as base64 values.
 *
 * This helper is mainly useful to decide wether a key should be skipped or not
 * during case conversion (snake_case, camelCase...).
 *
 * @param {string} x
 * @returns {Boolean}
 */
export default (x) => (
  // Values that we encode as base64 should all be longer than 32 bits (~40 chars in base64)
  // while non-base64 keys in objects are not expected to be longer than 40 characters,
  // so checking lenght seems to be the most efficient discriminator.
  x.length > 40
  && (isBase64(x, { urlSafe: false }) || isBase64(x, { urlSafe: true }))
);
