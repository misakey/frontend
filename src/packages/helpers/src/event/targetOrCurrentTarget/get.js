import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
// HELPERS
const targetProp = prop('target');
const currentTargetProp = prop('currentTarget');


export default (event) => {
  const target = targetProp(event);
  return !isNil(target)
    ? target
    : currentTargetProp(event);
};
