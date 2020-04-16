import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
// HELPERS
const targetProp = prop('target');


export default (event) => {
  const target = targetProp(event);
  return !isNil(target);
};
