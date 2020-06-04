import anyPass from '@misakey/helpers/anyPass';
import complement from '@misakey/helpers/complement';
import compose from '@misakey/helpers/compose';

export default compose(complement, anyPass);
