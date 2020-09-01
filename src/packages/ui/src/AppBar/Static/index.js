import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';

import AppBar, { PROP_TYPES } from '@misakey/ui/AppBar';

const AppBarStatic = ComponentProxy(AppBar);

AppBarStatic.propTypes = {
  ...PROP_TYPES,
  position: PropTypes.oneOf(['absolute', 'fixed', 'relative', 'static', 'sticky']),
};

AppBarStatic.defaultProps = {
  position: 'static',
  disableOffset: true,
};

export default AppBarStatic;
