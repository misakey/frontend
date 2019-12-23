export const BitFieldPacker = class {
  constructor(packingVersion) {
    // eslint-disable-next-line no-console
    console.error('class BitFieldPacker is deprecated, should use JSON-based serialization');
    if (packingVersion) {
      this.content = new Uint8Array([packingVersion]);
    } else {
      this.content = new Uint8Array(0);
    }
  }

  packBasic(data) {
    const resultSize = (
      (this.content ? this.content.length : 0)
      + data.length
    );
    const result = new Uint8Array(resultSize);
    let currentIndex = 0;
    if (this.content) {
      result.set(this.content, currentIndex);
      currentIndex += this.content.length;
    }
    result.set(data, currentIndex);

    this.content = result;
  }

  packWithLengthByte(data) {
    if (data.length > 255) { throw Error('value too long to pack as bit field with length byte'); }
    this.packBasic(new Uint8Array([data.length]));
    this.packBasic(data);
  }
};
