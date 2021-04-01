import any from '@misakey/core/helpers/any';
import complement from '@misakey/core/helpers/complement';
import isEmpty from '@misakey/core/helpers/isEmpty';

export default any(complement(isEmpty));
