import {
  OwnerCryptoContext,
} from './cryptoWrapper';

const secretKey = '35v4NhTiijuMtzshw2RqGjWW1mhEPv2qPB5GLTeqgLw=';
const publicKey = 'c3EAo74Vpkt5d+8M5NGMP3qnJOdLdcLrLoM7SQaRbXg=';
const store = {
  channelsPublicInfo: {},
  ownerId: undefined,
  secrets: {
    secretKey,
    channelKeys: {},
  },
  publicKey,
};
const globalOwnerCryptoContext = new OwnerCryptoContext(store);

test('OwnerCryptoContext.getPublicKeysWeCanDecryptFrom', () => {
  expect(globalOwnerCryptoContext.getPublicKeysWeCanDecryptFrom()).toEqual([publicKey]);
});

test('OwnerCryptoContext.blobShouldBeDecryptable', () => {
  expect(globalOwnerCryptoContext.shouldBlobBeDecryptable(publicKey)).toEqual(true);
  expect(globalOwnerCryptoContext.shouldBlobBeDecryptable('someFakePublicKey==')).toEqual(false);
});
