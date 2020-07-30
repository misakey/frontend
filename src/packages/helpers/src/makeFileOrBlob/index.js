import isNil from '@misakey/helpers/isNil';

// IE11 does not support new File() constructor
export default (bits, name, options = {}) => {
  const { lastModified, type } = options;

  const compatOptions = isNil(type) ? {} : { type };

  let file;
  try {
    file = new File(
      bits,
      name,
      options,
    );
  } catch (e) {
    file = new Blob(
      bits,
      compatOptions,
    );
    if (!isNil(lastModified)) {
      file.lastModified = lastModified;
    }
    file.name = name;
  }
  return file;
};
