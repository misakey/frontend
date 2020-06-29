import { share, combine } from './secretSharing';

const TEST_SECRET_BYTES = Uint8Array.from([
  32, 57, 252, 228, 154, 165, 224, 88,
  201, 126, 210, 204, 5, 201, 73, 170,
  217, 39, 178, 241, 29, 196, 151, 219,
  84, 204, 184, 231, 160, 113, 173, 198,
]);

test('secret sharing is correct', () => {
  const { shareOne, shareTwo } = share(TEST_SECRET_BYTES);
  const combined = combine(shareOne, shareTwo);

  expect(combined).toEqual(TEST_SECRET_BYTES);
});
