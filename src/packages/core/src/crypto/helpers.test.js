import { encodeHex } from './helpers/encodeHex';
import { decodeHex } from './helpers/decodeHex';

it('converts bytes to hexadecimal and back', () => {
  const x = new Uint8Array([32, 57, 252, 228, 154, 165, 224, 88]);
  const xx = encodeHex(x);
  const xxx = decodeHex(xx);
  expect(xxx).toEqual(x);
});
