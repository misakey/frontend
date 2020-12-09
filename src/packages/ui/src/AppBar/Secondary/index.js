import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';

import AppBar, { PROP_TYPES } from '@misakey/ui/AppBar';

const AppBarSecondary = ComponentProxy(AppBar);

AppBarSecondary.propTypes = {
  ...PROP_TYPES,
  color: PropTypes.string,
};

AppBarSecondary.defaultProps = {
  color: 'secondary',
};

export default AppBarSecondary;
