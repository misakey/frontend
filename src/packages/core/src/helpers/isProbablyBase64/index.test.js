import isProbablyBase64 from './index';

describe('isProbablyBase64', () => {
  it('returns true on a base64-encoded public keys', () => {
    expect(isProbablyBase64('-y7bMOiXxJNorjIjPhPDXV3cXMtRRZu7KW4WhlcJo1')).toBe(true);
  });

  it('returns false on a short value that happens to be valid base64', () => {
    expect(isProbablyBase64('fooBar')).toBe(false);
  });
});
