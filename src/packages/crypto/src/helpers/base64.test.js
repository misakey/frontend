import { makeSafeForUrl, getFromUrlSafe } from './base64';

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
