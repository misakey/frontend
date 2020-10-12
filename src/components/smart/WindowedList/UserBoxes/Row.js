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
const INTERNAL_DATA = ['byPagination', 'selectedId'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, style, data, ...rest }) => (
  <BoxListItemSkeleton
    style={style}
    {...rest}
  />
);

Skeleton.propTypes = ROW_PROP_TYPES;

Skeleton.defaultProps = {
  selected: false,
};


const Row = ({ style, data, box, id, dispatchReceivedBox, ...rest }) => {
  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );

  const shouldFetch = useMemo(() => isNil(box) && !isNil(id), [box, id]);

  const onError = useOnGetBoxError(id);

  useFetchEffect(getBox, { shouldFetch }, { onSuccess: dispatchReceivedBox, onError });

  return (
    <BoxListItem
      style={style}
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
