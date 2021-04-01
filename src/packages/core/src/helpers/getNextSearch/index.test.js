import getNextSearch from './index';

const NO_MAP = [
  new Set(),
  {},
  [],
  '',
  1,
  null,
];

describe('testing getNextSearch', () => {
  const search = '?test=true&valid=expected';
  const expectedSearch = 'test=true&valid=expected';
  const emptySearch = '';

  const emptyMap = new Map();
  const searchMap = new Map([['test', true], ['valid', 'expected']]);

  it('returns search by default (no initial ?)', () => {
    expect(getNextSearch(search)).toBe(expectedSearch);
  });

  it('returns same result regardless of initial ?', () => {
    expect(getNextSearch(search)).toBe(getNextSearch(expectedSearch));
  });

  it('returns search with empty paramsMap (no initial ?)', () => {
    expect(getNextSearch(search, emptyMap)).toBe(expectedSearch);
  });

  it.each(NO_MAP)(
    'throws error with anything else than Map: %p',
    (otherMap) => {
      expect(() => getNextSearch(search, otherMap)).toThrow();
    },
  );

  it('returns search built from empty in the same format (no initial ?)', () => {
    expect(getNextSearch(emptySearch, searchMap)).toBe(expectedSearch);
  });

  it('returns search built from empty in a different format because of order (no initial ?)', () => {
    const orderSearchMap = new Map([['valid', 'expected'], ['test', true]]);
    const nextSearch = getNextSearch(emptySearch, orderSearchMap);
    expect(nextSearch).not.toBe(expectedSearch);
    expect(nextSearch).toBe('valid=expected&test=true');
  });

  it('returns search with extra params (no initial ?)', () => {
    const orderSearchMap = new Map([['clean', 'okay']]);
    const expected = `${expectedSearch}&clean=okay`;

    expect(getNextSearch(search, orderSearchMap)).toBe(expected);
  });

  it('returns search with updated params', () => {
    const orderSearchMap = new Map([['test', false], ['valid', 'unsure']]);
    const expected = 'test=false&valid=unsure';
    expect(getNextSearch(search, orderSearchMap)).toBe(expected);
  });
});
