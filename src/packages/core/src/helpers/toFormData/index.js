import isFile from '../isFile';
import isBlob from '../isBlob';
import isArray from '../isArray';
import isObject from '../isObject';

// HELPERS
// NB: FormData#append converts any value other than Blob or File to string.
export const appendData = (data, formData) => {
  if (isFile(data) || isBlob(data)) {
    formData.append(data);
  } else if (isArray(data)) {
    data.forEach((item, index) => {
      formData.append(index, item);
    });
  } else if (isObject(data)) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
  } else {
    formData.append(data);
  }
};

export default (data) => {
  const formData = new FormData();
  appendData(data, formData);
  return formData;
};
