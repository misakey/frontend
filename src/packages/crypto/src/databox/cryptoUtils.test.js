import {
  countZeroPaddingLength,
} from './cryptoUtils';

describe('countZeroPaddingLength', () => {
  it('is correct on an array with non-zero padding length', () => {
    const a = new Uint8Array([0, 0, 0, 5]);
    expect(countZeroPaddingLength(a.buffer)).toEqual(3);
  });

  it('is correct on an array with zero padding length', () => {
    const a = new Uint8Array([2, 5]);
    expect(countZeroPaddingLength(a.buffer)).toEqual(0);
  });
});
