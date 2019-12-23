/* eslint-disable max-classes-per-file */
function startsWithNZeros(arrayBuffer, n) {
  const byteArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < n; i += 1) {
    if (byteArray[i] !== 0) {
      return false;
    }
  }
  return true;
}

export function countZeroPaddingLength(arrayBuffer) {
  const byteArray = new Uint8Array(arrayBuffer);
  const indexOfFirstNonZeroByte = byteArray.findIndex((x) => x !== 0);
  if (indexOfFirstNonZeroByte === -1) {
    throw Error('could not find a non-null byte');
  }
  return indexOfFirstNonZeroByte;
}

// commented out because it is dangerous to use it in code,
// we may throw by mistake and break the code
// /*
//  * First parameter must be a javascript Uint8Array
// */
// export function checkByteOffsetMatchesZeroPadding(
//   { byteOffset, buffer: arrayBuffer },
//   expectByteOffset = false,
// ) {
//   if (!byteOffset && expectByteOffset) {
//     throw Error('array has no byteOffset and expectByteOffset is true');
//   }
//   if (byteOffset) {
//     const zeroPaddingLength = countZeroPaddingLength(arrayBuffer);
//     if (zeroPaddingLength !== byteOffset) {
//       throw new Error(
//         `array has a byteOffset of ${byteOffset}`
//         + `but has a zero padding of length ${zeroPaddingLength}`,
//       );
//     }
//   }
//   // if byteOffset is zero we do not dare throwing because there may be
// }

export function fileToUint8Array(file, byteOffset) {
  const fileReader = new FileReader();
  const promise = new Promise((resolve) => {
    fileReader.readAsArrayBuffer(file);
    fileReader.addEventListener('loadend', () => {
      const finalByteOffset = startsWithNZeros(fileReader.result, byteOffset)
        ? byteOffset
        : undefined;
      const result = new Uint8Array(fileReader.result, finalByteOffset);
      resolve(result);
    });
  });
  return promise;
}

export function blobFromUint8Array(array, dropByteBeforeOffset = false) {
  // .slice(0) will drop all the bytes before the byte offset
  const bytes = dropByteBeforeOffset ? [array.slice(0).buffer] : [array.buffer];
  const result = new Blob(bytes, { type: 'application/octet-stream' });
  return result;
}

// taken from https://stackoverflow.com/a/34310051/3025740
/* eslint-disable */
export function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}
/* eslint-enable */

// Bit Field Packing and Unpacking

export const BitFieldPacker = class {
  constructor() {
    this.content = new Uint8Array(0);
  }

  pack(data, prependLength) {
    const resultSize = (
      (this.content ? this.content.length : 0)
      + (prependLength ? 1 : 0)
      + data.length
    );
    const result = new Uint8Array(resultSize);
    let currentIndex = 0;
    if (this.content) {
      result.set(this.content, currentIndex);
      currentIndex += this.content.length;
    }
    if (prependLength) {
      if (data.length > 255) { throw Error('value too long to pack as bit field with length byte'); }
      result.set(new Uint8Array([data.length]), currentIndex);
      currentIndex += 1;
    }
    result.set(data, currentIndex);

    this.content = result;
  }
};

export const BitFieldUnpacker = class {
  constructor(data) {
    this.content = data;
  }

  unpack(hasLengthByte, length) {
    if (length && hasLengthByte) { throw Error('parameters "hasLengthByte" and "length" are mutually exclusive'); }
    if (this.content.length === 0) { throw Error('no more data to unpack'); }

    const { content } = this;

    let sliceStart;
    let sliceEnd;
    if (hasLengthByte) {
      sliceStart = 1;
      // eslint-disable-next-line no-shadow
      const [length] = content.slice(0, 1);
      sliceEnd = sliceStart + length;
    } else if (length) {
      sliceStart = 0;
      sliceEnd = length;
    } else {
      sliceStart = 0;
      sliceEnd = undefined;
    }

    const result = this.content.slice(sliceStart, sliceEnd);
    this.content = sliceEnd ? this.content.slice(sliceEnd) : null;

    return result;
  }
};
