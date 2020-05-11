import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DataboxSchema from 'store/schemas/Databox';

import { denormalize } from 'normalizr';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import omit from '@misakey/helpers/omit';

import RequestListItem, { RequestListItemSkeleton } from 'components/dumb/ListItem/Requests';
import { ROW_PROP_TYPES } from 'components/smart/WindowedList';

// CONSTANTS
const INTERNAL_DATA = ['byPagination'];

// HELPERS
const producerApplicationPath = path(['producer', 'application']);
const isApplicationLinked = (request) => {
  const producerApplication = producerApplicationPath(request);
  return !isNil(producerApplication);
};

const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, style, data, ...rest }) => (
  <RequestListItemSkeleton
    style={style}
    {...rest}
  />
);

Skeleton.propTypes = ROW_PROP_TYPES;


const Row = ({ style, data, ...rest }) => (
  <RequestListItem
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
  const request = isNil(id)
    ? null
    : denormalize(id, DataboxSchema.entity, state.entities);
  return {
    request,
    isFetchingApplication: !isApplicationLinked(request),
  };
};


export default connect(mapStateToProps, {})(Row);
