import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';
// HELPERS
const targetProp = prop('target');


export default (event) => {
  const target = targetProp(event);
  return !isNil(target);
};
