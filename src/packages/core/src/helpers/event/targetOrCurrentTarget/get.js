import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';
// HELPERS
const targetProp = prop('target');
const currentTargetProp = prop('currentTarget');


export default (event) => {
  const target = targetProp(event);
  return !isNil(target)
    ? target
    : currentTargetProp(event);
};
