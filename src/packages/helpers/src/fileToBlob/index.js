export default (file) => {
  const { name, lastModified, size, type } = file;

  return {
    blob: file,
    key: `${name}-${lastModified}-${size}-${type}`,
  };
};
