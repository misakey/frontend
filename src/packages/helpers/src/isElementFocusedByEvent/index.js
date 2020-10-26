import isNil from '@misakey/helpers/isNil';

export default (event, domElement) => {
  if (isNil(domElement) || isNil(domElement.getBoundingClientRect)) { return null; }

  const { x, y, width, height } = domElement.getBoundingClientRect();
  const { clientX, clientY } = event;

  return (x < clientX && clientX < x + width) && (y < clientY && clientY < y + height);
};

