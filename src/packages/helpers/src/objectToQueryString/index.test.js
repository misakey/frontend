import objectToQueryString from '.';

const TESTS = [[
  { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Slayer'] },
  'name=myCollection&collection=Nirvana,Slipknot,Slayer',
], [
  { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Motörhead'] },
  'name=myCollection&collection=Nirvana,Slipknot,Motörhead',
], [
  { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Slayer'], object: { nirvana: 'Nirvana' } },
  'name=myCollection&collection=Nirvana,Slipknot,Slayer&object[nirvana]=Nirvana',
]];

describe.each(TESTS)('objectToQueryString(%s)', (object, expected) => {
  test(`returns ${expected}`, () => {
    expect(decodeURIComponent(objectToQueryString(object))).toBe(expected);
  });
});
