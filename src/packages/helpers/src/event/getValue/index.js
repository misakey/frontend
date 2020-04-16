import getTargetOrCurrentTarget from '@misakey/helpers/event/targetOrCurrentTarget/get';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';

// HELPERS
const valueProp = prop('value');

export default compose(
  valueProp,
  getTargetOrCurrentTarget,
);
