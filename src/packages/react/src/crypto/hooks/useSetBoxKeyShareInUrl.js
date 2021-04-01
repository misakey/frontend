import { useMemo, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';


import { selectors } from '@misakey/react/crypto/store/reducers';

const { makeGetBoxKeyShare } = selectors;

export default function useSetBoxKeyShareInUrl(boxId) {
  const { pathname, search, hash: locationHash } = useLocation();
  const { replace } = useHistory();

  const getBoxKeyShare = useMemo(
    () => makeGetBoxKeyShare(),
    [],
  );
  const keyShareInStore = useSelector((state) => getBoxKeyShare(state, boxId));

  useEffect(
    () => {
      if (keyShareInStore && locationHash !== `#${keyShareInStore}`) {
        replace({ pathname, search, hash: `#${keyShareInStore}` });
      }
    },
    [keyShareInStore, locationHash, pathname, search, replace],
  );
}
