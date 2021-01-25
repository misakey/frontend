import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BoxesSchema from 'store/schemas/Boxes';

import { normalize, denormalize } from 'normalizr';
import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { getBoxBuilder } from '@misakey/helpers/builder/boxes';
import useOnGetBoxError from 'hooks/useFetchBoxDetails/onError';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { receiveEntities } from '@misakey/store/actions/entities';

import BoxListItem, { BoxListItemSkeleton } from 'components/smart/ListItem/Boxes';
import { ROW_PROP_TYPES } from 'components/smart/WindowedList';

// CONSTANTS
const INTERNAL_DATA = ['byPagination', 'selectedId', 'guttersTop'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, style, data: { guttersTop }, ...rest }) => (
  <BoxListItemSkeleton
    style={{ ...style, top: style.top + guttersTop }}
    {...rest}
  />
);

Skeleton.propTypes = ROW_PROP_TYPES;

Skeleton.defaultProps = {
  selected: false,
};


const Row = ({ style, index, data, box, id, dispatchReceivedBox, ...rest }) => {
  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );

  const { guttersTop = 0 } = useMemo(() => data, [data]);

  const shouldFetch = useMemo(() => isNil(box) && !isNil(id), [box, id]);

  const containerProps = useMemo(
    () => ({
      style: { ...style, top: style.top + guttersTop },
      index,
    }),
    [style, index, guttersTop],
  );

  const onError = useOnGetBoxError(id);

  const { isFetching } = useFetchEffect(
    getBox,
    { shouldFetch },
    { onSuccess: dispatchReceivedBox, onError },
  );

  if (isFetching) {
    return <Skeleton style={style} index={index} data={data} {...rest} />;
  }

  return (
    <BoxListItem
      containerProps={containerProps}
      box={box}
      {...omitInternalData(data)}
      {...rest}
    />
  );
};

Row.propTypes = {
  ...ROW_PROP_TYPES,
  data: PropTypes.object,
  selected: PropTypes.bool,
  // CONNECT
  box: PropTypes.shape(BoxesSchema.propTypes),
  id: PropTypes.string,
  dispatchReceivedBox: PropTypes.func.isRequired,
};

Row.defaultProps = {
  data: {},
  box: null,
  id: null,
  selected: false,
};

// CONNECT
const mapStateToProps = (state, { index, data: { byPagination, selectedId } }) => {
  const id = byPagination[index];
  const box = isNil(id)
    ? null
    : denormalize(id, BoxesSchema.entity, state.entities);
  return {
    id,
    box,
    selected: !isNil(selectedId) && selectedId === id,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceivedBox: (data) => {
    const normalized = normalize(data, BoxesSchema.entity);
    const { entities } = normalized;
    return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Row);
