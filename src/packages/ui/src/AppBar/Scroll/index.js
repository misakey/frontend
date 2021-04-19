import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useIntersectionObserver, { HAS_INTERSECTION_OBSERVER } from '@misakey/hooks/useIntersectionObserver';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';

import AppBar from '@misakey/ui/AppBar';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  boxHidden: {
    opacity: 0,
  },
}));

// COMPONENTS
const AppBarScroll = ({
  component: Component,
  children, transitionChildren,
  targetRef,
  observerOptions,
  scrollTarget,
  scrollThreshold,
  ...rest
}) => {
  const classes = useStyles();
  const boxRef = useRef();

  const trigger = useScrollTrigger({
    threshold: scrollThreshold,
    target: scrollTarget,
  });

  const onOpacity = useCallback(
    (value, element) => {
      if (!isNil(element)) {
        element.style.opacity = value; // eslint-disable-line no-param-reassign
      }
    },
    [],
  );

  const onIntersect = useCallback(
    ({ intersectionRatio, target }) => {
      onOpacity(intersectionRatio, target);
      onOpacity(1 - intersectionRatio, boxRef.current);
    },
    [onOpacity, boxRef],
  );

  useIntersectionObserver(targetRef, onIntersect, true, observerOptions);

  useEffect(
    () => {
      if (!HAS_INTERSECTION_OBSERVER) {
        onOpacity(trigger ? 1 : 0, boxRef.current);
      }
    },
    [trigger, onOpacity, boxRef],
  );

  return (
    <Component {...rest}>
      {children}
      <Box display="flex" flexGrow={1} className={classes.boxHidden} ref={boxRef}>
        {transitionChildren}
      </Box>
    </Component>
  );
};

AppBarScroll.propTypes = {
  component: PropTypes.elementType,
  transitionChildren: PropTypes.node,
  children: PropTypes.node,
  targetRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
  observerOptions: PropTypes.shape({
    root: PropTypes.element,
    rootMargin: PropTypes.string,
    threshold: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  }),
  scrollTarget: PropTypes.instanceOf(Element),
  scrollThreshold: PropTypes.number,
};

AppBarScroll.defaultProps = {
  component: AppBar,
  transitionChildren: null,
  children: null,
  observerOptions: {},
  scrollTarget: undefined,
  scrollThreshold: 0,
};

export default AppBarScroll;
