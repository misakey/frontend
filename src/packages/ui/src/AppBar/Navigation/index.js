import React from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import AppBarNavigationHistory from '@misakey/ui/AppBar/Navigation/History';
import AppBarNavigationLink from '@misakey/ui/AppBar/Navigation/Link';

const AppBarNavigation = ({ homePath, ...rest }) => {
  if (!isNil(homePath)) {
    return <AppBarNavigationLink homePath={homePath} {...rest} />;
  }

  return <AppBarNavigationHistory {...rest} />;
};

AppBarNavigation.propTypes = {
  homePath: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

AppBarNavigation.defaultProps = {
  homePath: null,
};

export default AppBarNavigation;
