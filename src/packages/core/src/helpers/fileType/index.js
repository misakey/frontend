import isEmpty from '@misakey/core/helpers/isEmpty';

const getExtensionFromName = (name) => {
  if (isEmpty(name)) {
    return '';
  }
  const pos = name.lastIndexOf('.');
  if (pos < 1) {
    return '';
  }
  return name.slice(pos + 1);
};

export default ({ type, name }) => (isEmpty(type)
  ? getExtensionFromName(name)
  : type);
