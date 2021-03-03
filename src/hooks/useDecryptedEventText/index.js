import { useSelector } from 'react-redux';

import decryptText from '@misakey/crypto/box/decryptText';
import isNil from '@misakey/helpers/isNil';

import { useMemo } from 'react';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { useTranslation } from 'react-i18next';

const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

export default (event) => {
  const { t } = useTranslation('common');

  const { content: { encrypted, publicKey } } = useSafeDestr(event);

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));

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
