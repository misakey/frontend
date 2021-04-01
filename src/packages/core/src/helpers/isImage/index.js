import isDataURI from '@misakey/core/helpers/isDataURI';

function isImage(string) {
  if (!isDataURI(string)) { return false; }

  return string.match(/data:image\/([a-zA-Z]*);base64,([^"]*)/g);
}

export default isImage;
