export default ({ pathname, search, hash }) => `${pathname || ''}${search || ''}${hash || ''}`;
