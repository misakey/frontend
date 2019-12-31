import React from 'react';
import PropTypes from 'prop-types';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

/**
 * @param props
 * @returns {React.ReactSVGElement}
 * @constructor
 */
function ElevationScroll({ children, threshold, target }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold,
    target,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

ElevationScroll.propTypes = {
  children: PropTypes.element.isRequired,
  threshold: PropTypes.number,
  target: PropTypes.instanceOf(Element),
};

ElevationScroll.defaultProps = {
  threshold: 0,
  target: undefined,
};

export default ElevationScroll;
