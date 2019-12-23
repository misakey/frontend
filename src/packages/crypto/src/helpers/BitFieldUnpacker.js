export const BitFieldUnpacker = class {
  constructor(data) {
    this.content = data;
    this.hasStartedUnpacking = false;
  }

  getReadyToUnpack() {
    if (!this.content) { throw Error('no bytes left to unpack'); }
    this.hasStartedUnpacking = true;
  }

  unpackNBytes(n) {
    this.getReadyToUnpack();
    if (n > this.content.length) { throw Error('not enough bytes left to unpack'); }
    const result = this.content.slice(0, n);
    this.content = this.content.slice(n);

    return result;
  }

  getPackingVersion() {
    if (this.hasStartedUnpacking) {
      throw Error('cannot get packing version after having started unpacking');
    }
    const [packingVersion] = this.unpackNBytes(1);
    return packingVersion;
  }

  unpackRemainingBytes() {
    this.getReadyToUnpack();
    const result = this.content;
    this.content = null;

    return result;
  }

  unpackFromLenghtByte(acceptLengthZero = false) {
    this.getReadyToUnpack();
    const [length] = this.unpackNBytes(1);

    if (length === 0 && acceptLengthZero === false) {
      throw Error('length zero is not allowed for this field');
    }

    const result = this.unpackNBytes(length);
    return result;
  }

  unpackOptionalFromLenghtByte() {
    const acceptLengthZero = true;
    const result = this.unpackFromLenghtByte(acceptLengthZero);
    return (result.length === 0
      ? null
      : result
    );
  }
};
