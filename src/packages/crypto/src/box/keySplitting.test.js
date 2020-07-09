import { generateAsymmetricKeyPair } from '../crypto';
import {
  splitBoxSecretKey,
  computeInvitationHash,
  combineShares,
} from './keySplitting';

test('key splitting is correct', () => {
  const { secretKey } = generateAsymmetricKeyPair();

  const { invitationKeyShare, misakeyKeyShare } = splitBoxSecretKey(secretKey, { boxId: 'fake' });

  const invitationHash = computeInvitationHash(invitationKeyShare);

  expect(invitationHash).toEqual(misakeyKeyShare.otherShareHash);

  const rebuiltSecretKey = combineShares(invitationKeyShare, misakeyKeyShare);

  expect(rebuiltSecretKey).toEqual(secretKey);
});
