import React, { useMemo, useState, useCallback, useEffect, forwardRef } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import Grow from '@material-ui/core/Grow';
import AvatarClient from '@misakey/ui/Avatar/Client';

// COMPONENTS
const AvatarClientGrow = forwardRef(({
  src,
  transitionProps: { in: externalIn, ...transitionPropsRest },
  ...rest
}, ref) => {
  const [isLoaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => { setLoaded(true); }, [setLoaded]);

  const internalIn = useMemo(
    () => isLoaded || !src,
    [isLoaded, src],
  );

  const growIn = useMemo(
    () => (isNil(externalIn)
      ? internalIn
      : externalIn && internalIn),
    [externalIn, internalIn],
  );

  useEffect(() => {
    setLoaded(false);
  }, []);

  return (
    <Grow in={growIn} {...transitionPropsRest}>
      <AvatarClient
        ref={ref}
        src={src}
        onError={handleLoaded}
        onLoad={handleLoaded}
        {...rest}
      />
    </Grow>
  );
});

AvatarClientGrow.propTypes = {
  src: PropTypes.string,
  transitionProps: PropTypes.object,
};

AvatarClientGrow.defaultProps = {
  src: undefined,
  transitionProps: {},
};

export default AvatarClientGrow;
