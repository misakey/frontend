import noop from '.';

describe('test helper noop', () => {
  const mock = jest.fn();
  const DATA = [1, 'a', null, undefined, {}, [], Promise.resolve()];

  it('should not call spy function', () => {
    expect(noop(mock)).toBe(undefined);
    expect(mock).not.toHaveBeenCalled();
  });

  it.each(DATA)('should do no operation with %p', (data) => {
    expect(noop(data)).toBe(undefined);
  });
});
