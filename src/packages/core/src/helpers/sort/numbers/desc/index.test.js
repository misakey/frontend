import sortNumbersDesc from '.';

// CONSTANTS
const NUMBERS = [2, 58, -99, 0, 0, 1, 59, 58, -98, -1];
const DESC_SORTED_NUMBERS = [59, 58, 58, 2, 1, 0, 0, -1, -98, -99];
const EMPTY_LIST = [];

const NOT_LIST = [
  [undefined],
  [null],
  [1],
  [''],
  ['A'],
  [{}],
  [() => {}],
];

describe('testing helper sortNumbersDesc', () => {
  it.each(NOT_LIST)('should throw with param not list %p', (param) => {
    expect(() => { sortNumbersDesc(param); }).toThrow();
  });
  it('should return empty list', () => {
    expect(sortNumbersDesc(EMPTY_LIST)).toEqual(EMPTY_LIST);
  });
  it('should sort numbers desc', () => {
    expect(sortNumbersDesc(NUMBERS)).toEqual(DESC_SORTED_NUMBERS);
  });
});
