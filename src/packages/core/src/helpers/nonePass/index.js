import anyPass from '@misakey/core/helpers/anyPass';
import complement from '@misakey/core/helpers/complement';
import compose from '@misakey/core/helpers/compose';

export default compose(complement, anyPass);
