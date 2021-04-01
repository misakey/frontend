import objectToSnakeCaseDeep from './index';

describe('objectToSnakeCaseDeep', () => {
  it('converts objects properly', () => {
    const input = {
      fooBar: 42,
      veryNested: {
        theGood: {
          theBad: {
            theUgly: 'who, me?',
          },
        },
      },
    };
    const expectedResult = {
      foo_bar: 42,
      very_nested: {
        the_good: {
          the_bad: {
            the_ugly: 'who, me?',
          },
        },
      },
    };
    expect(objectToSnakeCaseDeep(input)).toEqual(expectedResult);
  });

  it('converts arrays properly', () => {
    const input = [
      42,
      'lol',
      { fooBar: 42 },
      {
        veryNested: {
          theGood: {
            theBad: {
              theUgly: 'who, me?',
            },
          },
        },
      },
    ];
    const expectedResult = [
      42,
      'lol',
      { foo_bar: 42 },
      {
        very_nested: {
          the_good: {
            the_bad: {
              the_ugly: 'who, me?',
            },
          },
        },
      },
    ];
    expect(objectToSnakeCaseDeep(input)).toEqual(expectedResult);
  });
});
