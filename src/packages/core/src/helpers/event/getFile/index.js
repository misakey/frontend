import getTargetOrCurrentTarget from '@misakey/core/helpers/event/targetOrCurrentTarget/get';
import path from '@misakey/core/helpers/path';
import compose from '@misakey/core/helpers/compose';

// HELPERS
const filePath = path(['files', '0']);

export default compose(
  filePath,
  getTargetOrCurrentTarget,
);
