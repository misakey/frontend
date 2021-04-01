import {
  makeSafeForUrl,
  getFromUrlSafe,
  isUnpaddedUrlSafeBase64,
} from './base64';

describe('makeSafeForUrl', () => {
  it('make string safe for url with padding', () => {
    const input = 'yqvUNFyS4cY=';
    const expected = 'yqvUNFyS4cY';
    expect(makeSafeForUrl(input)).toEqual(expected);
  });
  it('make string safe for url with no padding', () => {
    const input = '351BHtWUzl1T';
    const expected = '351BHtWUzl1T';
    expect(makeSafeForUrl(input)).toEqual(expected);
  });
  it('make string safe for url with two padding', () => {
    const input = 'geaIANzpcmLwIA==';
    const expected = 'geaIANzpcmLwIA';
    expect(makeSafeForUrl(input)).toEqual(expected);
  });
});

describe('getFromUrlSafe', () => {
  it('get original string with padding', () => {
    const input = 'yqvUNFyS4cY';
    const expected = 'yqvUNFyS4cY=';
    expect(getFromUrlSafe(input)).toEqual(expected);
  });

  it('get original string with no padding', () => {
    const input = '351BHtWUzl1T';
    const expected = '351BHtWUzl1T';
    expect(getFromUrlSafe(input)).toEqual(expected);
  });
  it('get original string with two padding', () => {
    const input = 'geaIANzpcmLwIA';
    const expected = 'geaIANzpcmLwIA==';
    expect(getFromUrlSafe(input)).toEqual(expected);
  });
});

describe('isUnpaddedUrlSafeBase64', () => {
  it('returns "true" on a base64 string that is clearly URL-safe and unpadded', () => {
    expect(isUnpaddedUrlSafeBase64('3kY_GYkd-io')).toBe(true);
  });

  it('returns "false" if there is a charecter typical of standard base64', () => {
    expect(isUnpaddedUrlSafeBase64('abc/')).toBe(false);
    expect(isUnpaddedUrlSafeBase64('+874')).toBe(false);
    expect(isUnpaddedUrlSafeBase64('Y7c5TX=')).toBe(false);
  });

  it('returns "true" as long as there are no characters typical of standard base64', () => {
    // A string that is valid both as standard and unpadded URL-safe base64
    expect(isUnpaddedUrlSafeBase64('UAepSdLDUFPa')).toBe(true);

    expect(isUnpaddedUrlSafeBase64("lol that's not even base64")).toBe(true);
  });
});
