import any from '@misakey/helpers/any';
import complement from '@misakey/helpers/complement';
import isEmpty from '@misakey/helpers/isEmpty';

export default any(complement(isEmpty));
