import sort from '@misakey/helpers/sort';
import isArray from '@misakey/helpers/isArray';

const descDiff = (a, b) => b - a;
const sortDesc = sort(descDiff);

export default (param) => {
  if (!isArray(param)) {
    throw new Error(`Cannot sort non-array param ${param}`);
  }
  return sortDesc(param);
};
