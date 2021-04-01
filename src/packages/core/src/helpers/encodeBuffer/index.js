
import trimEnd from '@misakey/core/helpers/trimEnd';

// Encode an ArrayBuffer into a base64 string.
export default (value) => trimEnd(
  btoa(new Uint8Array(value).reduce((s, byte) => s + String.fromCharCode(byte), '')).replace(/\+/g, '-').replace(/\//g, '_'),
  '=',
);
