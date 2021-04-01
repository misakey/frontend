import React, { useMemo, useCallback, forwardRef } from 'react';

import throttle from '@misakey/core/helpers/throttle';

import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import useIntersectionObserver from '@misakey/hooks/useIntersectionObserver';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    overflowAnchor: 'none',
  },
}));

// COMPONENTS
const ScrollAnchor = forwardRef((props, ref) => {
  const classes = useStyles();
  const combinedRef = useCombinedRefs(ref);

  const onAnchorIntersects = useCallback(
    (entry) => {
      if (entry.isIntersecting === true) {
        combinedRef.current.style.overflowAnchor = 'auto';
      } else {
        combinedRef.current.style.overflowAnchor = 'none';
      }
    },
    [combinedRef],
  );

  const onAnchorIntersectsThrottled = useMemo(
    () => throttle(onAnchorIntersects, 300),
    [onAnchorIntersects],
  );

  // watch anchor visibility, if visible, set overflowAnchor, else not
  useIntersectionObserver(combinedRef, onAnchorIntersectsThrottled, true);

  return (
    <Box
      ref={combinedRef}
      className={classes.root}
      {...props}
    />
  );
});

export default ScrollAnchor;
