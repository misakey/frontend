import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BoxesSchema from 'store/schemas/Boxes';

import { denormalize } from 'normalizr';
import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';

import BoxListItem, { BoxListItemSkeleton } from 'components/dumb/ListItem/Boxes';
import { ROW_PROP_TYPES } from 'components/smart/WindowedList';

// CONSTANTS
const INTERNAL_DATA = ['byPagination'];

const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, style, data, ...rest }) => (
  <BoxListItemSkeleton
    style={style}
    {...rest}
  />
);

Skeleton.propTypes = ROW_PROP_TYPES;


const Row = ({ style, data, ...rest }) => (
  <BoxListItem
    style={style}
    {...omitInternalData(data)}
    {...rest}
  />
);

Row.propTypes = {
  ...ROW_PROP_TYPES,
  data: PropTypes.object,
};

Row.defaultProps = {
  data: {},
};

// CONNECT
const mapStateToProps = (state, { index, data: { byPagination } }) => {
  const id = byPagination[index];
  const box = isNil(id)
    ? null
    : denormalize(id, BoxesSchema.entity, state.entities);
  return { box };
};

export default connect(mapStateToProps, {})(Row);
