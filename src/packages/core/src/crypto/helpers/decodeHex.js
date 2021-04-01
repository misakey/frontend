export function decodeHex(x) {
  if ((x.length % 2) !== 0) { throw Error('input string length must be a multiple of 2'); }
  const result = new Uint8Array(x.length / 2);
  for (let i = 0; i * 2 < x.length; i += 1) {
    const byte = parseInt(x.slice(2 * i, 2 * i + 2), 16);
    result.set([byte], i);
  }
  return result;
}
