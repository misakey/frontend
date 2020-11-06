import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import Box from '@material-ui/core/Box';

const BoxAlinea = ComponentProxy(Box);

BoxAlinea.propTypes = {
  ml: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

BoxAlinea.defaultProps = {
  ml: 2,
};

export default BoxAlinea;
