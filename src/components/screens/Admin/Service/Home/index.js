import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';

function ServiceHome({ appBarProps }) {
  return (
    <ScreenAction title="Home" appBarProps={appBarProps}>
      <Container />
    </ScreenAction>
  );
}

ServiceHome.propTypes = {
  appBarProps: PropTypes.object,
};

ServiceHome.defaultProps = {
  appBarProps: {},
};

export default ServiceHome;
