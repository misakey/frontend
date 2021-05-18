export default () => {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search || ''}${hash || ''}`;
};
