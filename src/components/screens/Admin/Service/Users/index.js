import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';

function ServiceUsers({ appBarProps }) {
  return (
    <ScreenAction title="Users" appBarProps={appBarProps}>
      <Container />
    </ScreenAction>
  );
}

ServiceUsers.propTypes = {
  appBarProps: PropTypes.object,
};

ServiceUsers.defaultProps = {
  appBarProps: {},
};

export default ServiceUsers;
