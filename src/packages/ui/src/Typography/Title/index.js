import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import ComponentProxy from '@misakey/ui/Component/Proxy';

const Title = ComponentProxy(Typography);

Title.propTypes = {
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  variant: PropTypes.string,
  gutterBottom: PropTypes.bool,
};

Title.defaultProps = {
  component: 'h2',
  variant: 'h5',
  gutterBottom: true,
  color: 'textPrimary',
};

export default Title;
