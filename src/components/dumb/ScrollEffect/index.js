import React from 'react';
import PropTypes from 'prop-types';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';

/**
 * Update a Component's props depending on scroll behavior
 */
function ScrollEffect(props) {
  const { children, onTrigger, propsOnTrigger, targetId, threshold, ...rest } = props;

  const [scrollTarget, setScrollTarget] = React.useState(undefined);

  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold,
    target: scrollTarget,
  });

  const handleRef = React.useCallback((node) => {
    if (node) { setScrollTarget(node); }
  }, []);

  const newProps = scrollTrigger ? { ...rest, ...propsOnTrigger } : rest;

  return React.cloneElement(children, { ...newProps, ref: handleRef });
}

ScrollEffect.propTypes = {
  children: PropTypes.element.isRequired,
  onTrigger: PropTypes.func,
  propsOnTrigger: PropTypes.object,
  threshold: PropTypes.number,
};

ScrollEffect.defaultProps = {
  onTrigger: null,
  propsOnTrigger: {},
  threshold: 0,
};

export default ScrollEffect;
