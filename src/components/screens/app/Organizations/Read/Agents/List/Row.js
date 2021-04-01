import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AgentSchema from '@misakey/react-auth/store/schemas/Agents';

import { denormalize } from 'normalizr';
import isNil from '@misakey/core/helpers/isNil';
import omit from '@misakey/core/helpers/omit';

import ListItemAgent from 'components/smart/ListItem/Agent';
import ListItemUserSkeleton from '@misakey/ui/ListItem/User/Skeleton';
import { ROW_PROP_TYPES } from 'components/smart/WindowedList';

// CONSTANTS
const INTERNAL_DATA = ['byPagination', 'selectedId', 'guttersTop'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// COMPONENTS
export const Skeleton = ({ index, style, data: { classes = {}, guttersTop = 0 }, ...rest }) => {
  const styleWithGutters = useMemo(
    () => ({ ...style, top: style.top + guttersTop }),
    [guttersTop, style],
  );

  return (
    <ListItemUserSkeleton
      classes={classes}
      style={styleWithGutters}
      {...rest}
    />
  );
};

Skeleton.propTypes = ROW_PROP_TYPES;

Skeleton.defaultProps = {
  selected: false,
};


const Row = ({ style, index, data, agent, id, dispatchReceivedBox, ...rest }) => {
  const { guttersTop = 0, classes = {} } = useMemo(() => data, [data]);

  const styleWithGutters = useMemo(
    () => ({ ...style, top: style.top + guttersTop }),
    [guttersTop, style],
  );

  const ContainerProps = useMemo(
    () => ({
      style: styleWithGutters,
      index,
    }),
    [styleWithGutters, index],
  );

  return (
    <ListItemAgent
      ContainerProps={ContainerProps}
      classes={classes}
      style={styleWithGutters}
      {...agent}
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
  agent: PropTypes.shape(AgentSchema.propTypes),
  id: PropTypes.string,
};

Row.defaultProps = {
  data: {},
  agent: null,
  id: null,
  selected: false,
};

// CONNECT
const mapStateToProps = (state, { index, data: { byPagination, selectedId } }) => {
  const id = byPagination[index];
  const agent = isNil(id)
    ? null
    : denormalize(id, AgentSchema.entity, state.entities);
  return {
    id,
    agent,
    selected: !isNil(selectedId) && selectedId === id,
  };
};

export default connect(mapStateToProps, {})(Row);
