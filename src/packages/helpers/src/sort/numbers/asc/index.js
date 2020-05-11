import sort from '@misakey/helpers/sort';
import isArray from '@misakey/helpers/isArray';

const ascDiff = (a, b) => a - b;
const sortAsc = sort(ascDiff);

export default (param) => {
  if (!isArray(param)) {
    throw new Error(`Cannot sort non-array param ${param}`);
  }
  return sortAsc(param);
};
