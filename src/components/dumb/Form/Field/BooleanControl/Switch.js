import PropTypes from 'prop-types';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import FieldBooleanControl from 'components/dumb/Form/Field/BooleanControl';
import Switch from '@material-ui/core/Switch';

const FieldBooleanControlSwitch = ComponentProxy(FieldBooleanControl);

FieldBooleanControlSwitch.propTypes = {
  control: PropTypes.elementType,
};

FieldBooleanControlSwitch.defaultProps = {
  control: Switch,
};

export default FieldBooleanControlSwitch;
