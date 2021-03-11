import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import useGoBack from '@misakey/hooks/useGoBack';

import AppBarNavigationBase from '@misakey/ui/AppBar/Navigation/Base';

// COMPONENTS
const AppBarNavigationHistory = forwardRef(({
  children,
  showGoBack,
  ...rest
}, ref) => {
  const { canGoBack, goBack } = useGoBack();

  const buttonProps = useMemo(
    () => ({
      onClick: goBack,
      onKeyPress: goBack,
    }),
    [goBack],
  );

  return (
    <AppBarNavigationBase
      ref={ref}
      showGoBack={canGoBack && showGoBack}
      buttonProps={buttonProps}
      {...rest}
    >
      {children}
    </AppBarNavigationBase>
  );
});

AppBarNavigationHistory.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  /**
   * null enable the dynamic display rule (width === 'xs)
   */
  showGoBack: PropTypes.oneOf([true, false, null]),
};

AppBarNavigationHistory.defaultProps = {
  children: null,
  showGoBack: true,
};

export default AppBarNavigationHistory;
