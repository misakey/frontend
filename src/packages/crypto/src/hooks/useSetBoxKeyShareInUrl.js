import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';


import { selectors } from '@misakey/crypto/store/reducers';

const { getBoxKeyShare } = selectors;

export default function useSetBoxKeyShareInUrl(boxId) {
  const { pathname, search, hash: locationHash } = useLocation();
  const { replace } = useHistory();

  const keyShareInStore = useSelector(getBoxKeyShare(boxId));

  useEffect(
    () => {
      if (keyShareInStore && locationHash !== `#${keyShareInStore}`) {
        replace({ pathname, search, hash: `#${keyShareInStore}` });
      }
    },
    [keyShareInStore, locationHash, pathname, search, replace],
  );
}
