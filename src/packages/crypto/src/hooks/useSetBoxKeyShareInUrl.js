import { useMemo } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';


import { selectors } from '@misakey/crypto/store/reducers';

const { makeGetBoxKeyShare } = selectors;

export default function (boxId) {
  const { pathname, search, hash: locationHash } = useLocation();
  const history = useHistory();

  const getBoxKeyShare = useMemo(() => makeGetBoxKeyShare(), []);
  const { value: keyShareInStore } = useSelector((state) => getBoxKeyShare(state, boxId) || {});

  if (keyShareInStore && locationHash !== `#${keyShareInStore}`) {
    history.replace({ pathname, search, hash: `#${keyShareInStore}` });
  }
}
