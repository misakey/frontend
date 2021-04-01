import objectToCamelCaseDeep from './index';

describe('objectToCamelCaseDeep', () => {
  it('converts objects properly', () => {
    const input = {
      foo_bar: 42,
      very_nested: {
        the_good: {
          the_bad: {
            the_ugly: 'who, me?',
          },
        },
      },
    };
    const expectedResult = {
      fooBar: 42,
      veryNested: {
        theGood: {
          theBad: {
            theUgly: 'who, me?',
          },
        },
      },
    };
    expect(objectToCamelCaseDeep(input)).toEqual(expectedResult);
  });

  it('converts arrays properly', () => {
    const input = [
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
    const expectedResult = [
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
    expect(objectToCamelCaseDeep(input)).toEqual(expectedResult);
  });
});
