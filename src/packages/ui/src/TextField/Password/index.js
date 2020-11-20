import PropTypes from 'prop-types';

import TextField from '@misakey/ui/TextField';
import ComponentProxy from '@misakey/ui/Component/Proxy';

// COMPONENTS
const TextFieldPassword = ComponentProxy(TextField);

TextFieldPassword.propTypes = {
  type: PropTypes.string,
};

TextFieldPassword.defaultProps = {
  type: 'password',
};

export default TextFieldPassword;
