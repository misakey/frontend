import {
  ProducerCryptoContext,
} from '.';

const blobBytes = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

test('ProducerCryptoContext.setOwnerPublicKey can be used to add new owners', () => {
  const ownerId = 'fakeId123';
  const producerCryptoContext = new ProducerCryptoContext();
  const allowNewOwner = true;
  // this function used to throw if the owner was not already present in state
  // (forcing you to use method addOwner)
  producerCryptoContext.setOwnerPublicKey(
    ownerId,
    'SJ6SYacUBbJDQBxljsUHrtzHWdgJlLD9P+d08DrGmxQ=',
    allowNewOwner,
  );
  const blob = new Blob([blobBytes.buffer], { type: 'application/octet-stream' });
  // encryptBlob will fail if the public key was not added properly
  expect(() => { producerCryptoContext.encryptBlob(blob, ownerId); }).not.toThrow();
});
