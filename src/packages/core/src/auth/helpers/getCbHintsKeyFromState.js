export default (state) => {
  const key = state.substring(0, 2);
  if (typeof window !== 'undefined') {
    return btoa(key);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(key).toString('base64');
  }
  return key;
};
