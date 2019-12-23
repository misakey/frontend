// mocking Argon2
// which is provided through a "<script>" tag in the react app
// importing this file is necessary in each test suite that involves
// "salted symmetric encryption" (used to encrypt the secrets backup)

// this class used to be part of helpers
// and was used for serialization of cryptograms
// now it not used any more for serialization of cryptograms,
// but because this test-only file was using it
// the class was copied as-is here

const BitFieldPacker = class {
  constructor(packingVersion) {
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

const crypto = require('crypto');

function sha256(x) {
  const hash = crypto.createHash('sha256');
  hash.update(x);
  return hash.digest();
}

window.argon2 = {
  hash: async ({ pass, salt, time, mem, hashLen, type }) => {
    const packer = new BitFieldPacker();
    packer.packBasic(sha256(pass + salt + time + mem + type));
    while (packer.content.length < hashLen) {
      const newBytes = sha256(packer.content);
      packer.packBasic(newBytes);
    }
    return { hash: packer.content.slice(0, hashLen) };
  },
  ArgonType: {
    Argon2i: 'Argon2i',
  },
};
