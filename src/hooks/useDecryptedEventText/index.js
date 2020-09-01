import decryptText from '@misakey/crypto/box/decryptText';
import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useTranslation } from 'react-i18next';

export default (event) => {
  const { t } = useTranslation('common');

  const { content: { encrypted, publicKey } } = useSafeDestr(event);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();

  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKeysWeCanDecryptFrom, publicKey],
  );

  const canBeDecrypted = useMemo(
    () => !isNil(secretKey),
    [secretKey],
  );

  const text = useMemo(() => {
    if (canBeDecrypted) {
      return decryptText(encrypted, secretKey);
    }
    return t('common:encrypted');
  }, [canBeDecrypted, encrypted, secretKey, t]);

  return text;
};
