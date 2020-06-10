import PropTypes from 'prop-types';
import { Formik } from 'formik';
import ComponentProxy from '@misakey/ui/Component/Proxy';

const MisakeyFormik = ComponentProxy(Formik);

MisakeyFormik.propTypes = {
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
};

MisakeyFormik.defaultProps = {
  validateOnBlur: false,
  validateOnChange: false,
};

export default MisakeyFormik;
