import React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';

function ServiceData({ appBarProps }) {
  return (
    <ScreenAction title="Data" appBarProps={appBarProps}>
      <Container />
    </ScreenAction>
  );
}

ServiceData.propTypes = {
  appBarProps: PropTypes.object,
};

ServiceData.defaultProps = {
  appBarProps: {},
};

export default ServiceData;
