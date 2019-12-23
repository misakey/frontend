import isNested from '.';

describe('isNested', () => {
  it('detects object in object', () => {
    const object = { name: 'myCollection', object: { nirvana: 'Nirvana' } };
    expect(isNested(object)).toBe(true);
  });
  it('detects array in object', () => {
    const object = { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Slayer'] };
    expect(isNested(object)).toBe(true);
  });
  it('honors "omitArrays" parameter', () => {
    const object = { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Slayer'] };
    expect(isNested(object, true)).toBe(false);
  });
  it('detects object in object even with "omitArrays" parameter', () => {
    const object = { name: 'myCollection', collection: ['Nirvana', 'Slipknot', 'Slayer'], object: {} };
    expect(isNested(object, true)).toBe(true);
  });
});
