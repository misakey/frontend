import * as Yup from 'yup';
import { invalid, required } from '@misakey/ui/constants/errorTypes';

export default Yup.object().shape({
  code: Yup.string()
    .matches(/^[0-9]{6}$/, { message: invalid })
    .required(required),
});
