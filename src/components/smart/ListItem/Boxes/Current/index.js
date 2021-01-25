import React, { useMemo } from 'react';


import routes from 'routes';
import { makeDenormalizeBoxSelector } from 'store/reducers/box';

import isNil from '@misakey/helpers/isNil';

import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ListItemBoxes, { BoxListItemSkeleton } from 'components/smart/ListItem/Boxes';

// CONSTANTS
const TO_ROUTE = routes.boxes.read._;


// COMPONENTS
const ListItemBoxesCurrent = (props) => {
  // NB: this component requires to be child of a Route with id as path param
  // ex: path=/boxes/:id
  const { id } = useParams();

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  const box = useSelector((state) => denormalizeBoxSelector(state, id));
  const { isMember, title } = useSafeDestr(box);

  const { pathname, hash } = useGeneratePathKeepingSearchAndHash(TO_ROUTE, { id });
  const to = useMemo(
    () => ({ pathname, hash }),
    [pathname, hash],
  );

  const linkProps = useMemo(
    () => (isMember ? { toRoute: TO_ROUTE } : { toRoute: TO_ROUTE, to }),
    [isMember, to],
  );

  if (isNil(title)) {
    return <BoxListItemSkeleton selected />;
  }

  return (
    <ListItemBoxes
      selected
      box={box}
      {...linkProps}
      {...props}
    />
  );
};

export default ListItemBoxesCurrent;
