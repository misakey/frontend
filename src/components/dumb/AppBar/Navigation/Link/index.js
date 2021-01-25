import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import { useLocation, Link } from 'react-router-dom';

import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import AppBarNavigationBase from 'components/dumb/AppBar/Navigation/Base';

// HOOKS
const useWithLocationState = (path, locationState) => useMemo(
  () => {
    if (isNil(locationState)) {
      return path;
    }
    if (isObject(path)) {
      return { state: locationState, ...path };
    }
    if (isNil(path)) {
      return path;
    }
    return { pathname: path, state: locationState };
  },
  [path, locationState],
);

// COMPONENTS
const AppBarNavigationLink = forwardRef(({
  children,
  homePath,
  replace,
  ...rest
}, ref) => {
  const { state } = useLocation();

  const homePathWithState = useWithLocationState(homePath, state);

  const buttonProps = useMemo(
    () => ({
      component: Link,
      to: homePathWithState,
      replace,
    }),
    [homePathWithState, replace],
  );

  return (
    <AppBarNavigationBase
      ref={ref}
      buttonProps={buttonProps}
      {...rest}
    >
      {children}
    </AppBarNavigationBase>
  );
});

AppBarNavigationLink.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  homePath: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  replace: PropTypes.bool,
};

AppBarNavigationLink.defaultProps = {
  children: null,
  homePath: null,
  replace: false,
};

export default AppBarNavigationLink;
