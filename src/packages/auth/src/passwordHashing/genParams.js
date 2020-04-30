import { randomBytes } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';

const SALT_LENGTH = 16;

export default function genParams() {
  const salt = encodeBase64(randomBytes(SALT_LENGTH));

  return {
    salt_base64: salt,
    iterations: 1,
    memory: 1024,
    // not used in frontend but this is required by API specs
    parallelism: 1,
  };
}
