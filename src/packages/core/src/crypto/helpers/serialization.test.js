import {
  objectKeysAreExactly,
  prepareForJsonSerialization,
  reversePrepareForJsonSerialization,
  serializeObjectToJson,
  deserializeJsonToObject,
} from './serialization';

// a flat object
// that looks like the kind of object we expect to have to process
const FLAT_OBJECT = {
  aString: 'lol',
  someBytes: new Uint8Array([1, 2, 3]),
};
const EXPECTED_FLAT_OBJECT_SERIALIZATION = '{"aString":"lol","someBytes":{"type":"Uint8Array","encoding":"base64","value":"AQID"}}';

const NESTED_OBJECT = {
  aString: 'lol',
  nested: {
    someBytes: new Uint8Array([1, 2, 3]),
  },
};
const EXPECTED_NESTED_OBJECT_SERIALIZATION = '{"aString":"lol","nested":{"someBytes":{"type":"Uint8Array","encoding":"base64","value":"AQID"}}}';

const OBJECT_WITH_ARRAY = {
  array: [1, 2, 3],
};

describe('objectKeysAreExactly', () => {
  it('returns true when we expect true', () => {
    expect(objectKeysAreExactly(
      ['lol', 'test'],
      { lol: 3, test: 5 },
    )).toBe(true);
  });

  it('returns false on more keys than expected', () => {
    expect(objectKeysAreExactly(
      ['lol', 'test'],
      { lol: 3, test: 5, foo: 42 },
    )).toBe(false);
  });

  it('returns false on missing keys', () => {
    expect(objectKeysAreExactly(
      ['lol', 'test'],
      { lol: 3 },
    )).toBe(false);
  });
});

describe('prepareForJsonSerialization', () => {
  it('does not throw on an flat unsurprising object', () => {
    expect(() => prepareForJsonSerialization(FLAT_OBJECT)).not.toThrow();
  });

  it('does not throw on a nested unsurprising object', () => {
    expect(() => prepareForJsonSerialization(NESTED_OBJECT)).not.toThrow();
  });

  it('is reversed by reversePrepareForJsonSerialization', () => {
    [NESTED_OBJECT, OBJECT_WITH_ARRAY].forEach((obj) => (
      expect(reversePrepareForJsonSerialization(prepareForJsonSerialization(obj))).toEqual(obj)
    ));
  });
});

describe('serializeObjectToJson', () => {
  it('correctly serializes flat unsurprising object', () => {
    expect(serializeObjectToJson(FLAT_OBJECT))
      .toEqual(EXPECTED_FLAT_OBJECT_SERIALIZATION);
  });

  it('correctly serializes nested unsurprising object', () => {
    expect(serializeObjectToJson(NESTED_OBJECT))
      .toEqual(EXPECTED_NESTED_OBJECT_SERIALIZATION);
  });

  it('is reversed by deserializeJsonToObject', () => {
    [NESTED_OBJECT, OBJECT_WITH_ARRAY].forEach((obj) => (
      expect(deserializeJsonToObject(serializeObjectToJson(obj))).toEqual(obj)
    ));
  });
});

describe('deserializeJsonToObject', () => {
  it('throws when given non-JSON', () => {
    expect(() => deserializeJsonToObject('FakeBase64MnaKPc==')).toThrow();
  });
});
