import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import InvertColorsIcon from '@material-ui/icons/InvertColors';
import IconButton from '@material-ui/core/IconButton';

import { toggleDarkmode } from 'store/actions/devicePreferences';

const DarkmodeSwitch = ({ onToggleDarkmode }) => (
  <IconButton
    edge="start"
    aria-label="Toggle Darkmode"
    onClick={onToggleDarkmode}
  >
    <InvertColorsIcon />
  </IconButton>
);

DarkmodeSwitch.propTypes = {
  onToggleDarkmode: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  onToggleDarkmode: () => dispatch(toggleDarkmode()),
});

export default connect(null, mapDispatchToProps)(DarkmodeSwitch);
