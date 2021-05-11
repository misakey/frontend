import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import { makeDenormalizeBoxSelector } from 'store/reducers/box';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { receiveEntities } from '@misakey/store/actions/entities';

import { normalize } from 'normalizr';
import isNil from '@misakey/core/helpers/isNil';
import omit from '@misakey/core/helpers/omit';
import { getBoxBuilder } from '@misakey/core/api/helpers/builder/boxes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useOnGetBoxError from 'hooks/useFetchBoxDetails/onError';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector, useDispatch } from 'react-redux';

import BoxListItem, { BoxListItemSkeleton } from 'components/smart/ListItem/Boxes';
import { ROW_PROP_TYPES } from 'components/smart/WindowedList';

// CONSTANTS
const INTERNAL_DATA = ['byPagination', 'selectedId', 'guttersTop'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, data: { classes = {} }, ...rest }) => (
  <BoxListItemSkeleton
    classes={classes}
    {...rest}
  />
);

Skeleton.propTypes = ROW_PROP_TYPES;

Skeleton.defaultProps = {
  selected: false,
};


const Row = ({ style, index, data, ...rest }) => {
  const [shouldFetchDelayed, setShouldFetchDelayed] = useState(false);
  const dispatch = useDispatch();

  const {
    byPagination, selectedId,
    guttersTop = 0, classes = {},
  } = useSafeDestr(data);

  const id = useMemo(
    () => byPagination[index],
    [byPagination, index],
  );

  const selected = useMemo(
    () => !isNil(selectedId) && selectedId === id,
    [id, selectedId],
  );

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  const box = useSelector((state) => denormalizeBoxSelector(state, id));

  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );

  const shouldFetch = useMemo(() => isNil(box) && !isNil(id), [box, id]);

  const ContainerProps = useMemo(
    () => ({
      style: { ...style, top: style.top + guttersTop },
      index,
    }),
    [style, guttersTop, index],
  );

  const onError = useOnGetBoxError(id);

  const dispatchReceivedBox = useCallback(
    (response) => {
      const normalized = normalize(response, BoxesSchema.entity);
      const { entities } = normalized;
      return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
    },
    [dispatch],
  );

  const { isFetching } = useFetchEffect(
    getBox,
    { shouldFetch: shouldFetchDelayed },
    { onSuccess: dispatchReceivedBox, onError },
  );

  // Wait for all pending store updates before fetching
  useEffect(
    () => {
      if (shouldFetch) {
        setTimeout(
          () => {
            setShouldFetchDelayed(true);
          },
          300,
        );
      } else {
        setShouldFetchDelayed(false);
      }
    },
    [shouldFetch],
  );

  if (shouldFetch || isFetching) {
    return (
      <Skeleton
        ContainerProps={ContainerProps}
        style={style}
        index={index}
        data={data}
        selected={selected}
        {...rest}
      />
    );
  }

  return (
    <BoxListItem
      id={id}
      ContainerProps={ContainerProps}
      classes={classes}
      box={box}
      selected={selected}
      {...omitInternalData(data)}
      {...rest}
    />
  );
};

Row.propTypes = {
  ...ROW_PROP_TYPES,
  data: PropTypes.object,
};

Row.defaultProps = {
  data: {},
};

export default Row;
