import getTargetOrCurrentTarget from '@misakey/core/helpers/event/targetOrCurrentTarget/get';
import prop from '@misakey/core/helpers/prop';
import compose from '@misakey/core/helpers/compose';

// HELPERS
const valueProp = prop('value');

export default compose(
  valueProp,
  getTargetOrCurrentTarget,
);
