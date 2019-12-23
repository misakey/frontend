export default (key) => (data) => {
  const formData = new FormData();
  formData.append(key, data);
  return formData;
};
