import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import AppBarNavigationHistory from 'components/dumb/AppBar/Navigation/History';
import AppBarNavigationLink from 'components/dumb/AppBar/Navigation/Link';

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
