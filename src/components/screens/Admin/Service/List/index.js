import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';

function ServiceList({ appBarProps }) {
  return (
    <ScreenAction title="List" appBarProps={appBarProps}>
      <Container />
    </ScreenAction>
  );
}

ServiceList.propTypes = {
  appBarProps: PropTypes.object,
};

ServiceList.defaultProps = {
  appBarProps: {},
};

export default ServiceList;
