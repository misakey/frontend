import {
  generateAsymmetricKeyPair,
  generateSymmetricKey,
} from './index';
import {
  splitKey,
  hashShare,
  combineShares,
} from './keySplitting';

describe('key splitting', () => {
  it('is correct with asymmetric keys', () => {
    const { secretKey } = generateAsymmetricKeyPair();

    const { userShare, misakeyShare } = splitKey(secretKey);

    const userShareHash = hashShare(userShare);

    expect(userShareHash).toEqual(misakeyShare.userShareHash);

    const rebuiltSecretKey = combineShares(userShare, misakeyShare);

    expect(rebuiltSecretKey).toEqual(secretKey);
  });

  it('is correct with symmetric keys', () => {
    const key = generateSymmetricKey();

    const { userShare, misakeyShare } = splitKey(key);

    const userShareHash = hashShare(userShare);

    expect(userShareHash).toEqual(misakeyShare.userShareHash);

    const rebuiltSecretKey = combineShares(userShare, misakeyShare);

    expect(rebuiltSecretKey).toEqual(key);
  });
});
