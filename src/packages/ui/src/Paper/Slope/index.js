import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';

// CONSTANTS
const SKEW_ANGLE = 5;
const SKEW_TAN = Math.tan((SKEW_ANGLE * Math.PI) / 180);
const SKEW_SPACING = `${SKEW_TAN} * 100vw`;

// HOOKS
const useStyles = makeStyles((theme) => ({
  slopePaperRoot: {
    backgroundColor: theme.palette.primary.main,
    transform: `skewY(${SKEW_ANGLE}deg)`,
    position: 'absolute',
    top: `calc(-${SKEW_SPACING})`,
    paddingTop: `calc(${SKEW_SPACING})`,
    height: `calc(50% + ${SKEW_SPACING})`,
    width: '100%',
  },
}));

// COMPONENTS
// - Absolute positionning requires a parent with `position: 'relative'`
// - Transformation applied on the element, forces to set
// `isolation: 'isolate'` to elements which aren't children but need to be set on top of this paper
const PaperSlope = ({ classes, ...props }) => {
  const internalClasses = useStyles();
  return (
    <Paper
      elevation={0}
      square
      classes={{ root: internalClasses.slopePaperRoot, ...classes }}
      {...props}
    />
  );
};

PaperSlope.propTypes = {
  classes: PropTypes.object,
};

PaperSlope.defaultProps = {
  classes: {},
};

export default PaperSlope;
