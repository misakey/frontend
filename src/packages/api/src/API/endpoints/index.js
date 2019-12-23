import mergeWith from '@misakey/helpers/mergeWith';
import Mock from '@misakey/api/Mock';

import types from './types';
import mocks from './mocks';

function customizer(objValue, srcValue) {
  if (srcValue instanceof Mock) {
    return { ...objValue, mock: srcValue };
  }

  return undefined;
}

export default mergeWith(types, mocks, customizer);
