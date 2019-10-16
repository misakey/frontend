import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

const { required } = errorTypes;

export default Yup.object().shape({
  code: Yup.string()
    // .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});
