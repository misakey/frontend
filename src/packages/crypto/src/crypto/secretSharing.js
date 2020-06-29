// TODO move this in the "core", but this will probably be done by making the core a directory

import { randomBytes } from 'tweetnacl';

export function share(secret) {
  const shareOne = randomBytes(secret.length);

  // The use of a bitwise operator in this line is on purpose
  // eslint-disable-next-line no-bitwise
  const shareTwo = new Uint8Array(secret.map((secretByte, i) => secretByte ^ shareOne[i]));

  return { shareOne, shareTwo };
}

export function combine(shareOne, shareTwo) {
  // The use of a bitwise operator in this line is on purpose
  // eslint-disable-next-line no-bitwise
  const secret = new Uint8Array(shareOne.map((byte, i) => byte ^ shareTwo[i]));

  return secret;
}
