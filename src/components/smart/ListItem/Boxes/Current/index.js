import React, { useMemo } from 'react';

import routes from 'routes';

import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { makeDenormalizeBoxSelector } from 'store/reducers/box';

import ListItemBoxes from 'components/smart/ListItem/Boxes';

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

  return (
    <ListItemBoxes
      selected
      toRoute={TO_ROUTE}
      box={box}
      {...props}
    />
  );
};

export default ListItemBoxesCurrent;
