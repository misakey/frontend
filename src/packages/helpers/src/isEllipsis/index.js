import isObject from '@misakey/helpers/isObject';
import isNumber from '@misakey/helpers/isNumber';

function isEllipsis(e, allocatedSpace = 0) {
  const NotAnObject = !isObject(e);
  const NotANumber = NotAnObject
    || !isNumber(e.offsetWidth)
    || !isNumber(e.scrollWidth)
    || !isNumber(allocatedSpace);

  if (NotAnObject || NotANumber) { return false; }

  return (e.offsetWidth < (e.scrollWidth - allocatedSpace));
}

export default isEllipsis;
