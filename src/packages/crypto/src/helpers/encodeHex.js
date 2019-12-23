/* eslint-disable */
// taken from https://stackoverflow.com/a/34310051/3025740
export function encodeHex(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}
/* eslint-enable */
