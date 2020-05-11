import sortNumbersAsc from '.';

// CONSTANTS
const NUMBERS = [2, 58, -99, 0, 0, 1, 59, 58, -98, -1];
const DESC_SORTED_NUMBERS = [-99, -98, -1, 0, 0, 1, 2, 58, 58, 59];
const EMPTY_LIST = [];

const NOT_LIST = [
  [undefined],
  [null],
  [1],
  [''],
  ['A'],
  [{}],
  [() => { }],
];

describe('testing helper sortNumbersAsc', () => {
  it.each(NOT_LIST)('should throw with param not list %p', (param) => {
    expect(() => { sortNumbersAsc(param); }).toThrow();
  });
  it('should return empty list', () => {
    expect(sortNumbersAsc(EMPTY_LIST)).toEqual(EMPTY_LIST);
  });
  it('should sort numbers desc', () => {
    expect(sortNumbersAsc(NUMBERS)).toEqual(DESC_SORTED_NUMBERS);
  });
});
