import sort from '@misakey/core/helpers/sort';
import isArray from '@misakey/core/helpers/isArray';

const ascDiff = (a, b) => a - b;
const sortAsc = sort(ascDiff);

export default (param) => {
  if (!isArray(param)) {
    throw new Error(`Cannot sort non-array param ${param}`);
  }
  return sortAsc(param);
};
