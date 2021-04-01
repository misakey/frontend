
import isIOS from '@misakey/core/helpers/isIOS';
import isChromeIOS from '@misakey/core/helpers/isIOS/Chrome';
import isDataUrl from '@misakey/core/helpers/isDataUrl';
import isBlobUrl from '@misakey/core/helpers/isBlobUrl';
import makeCompatFile from '@misakey/core/helpers/makeCompatFile';
import { createObjectURL } from '@misakey/core/helpers/objectURL';

// HELPERS
export default (data, filename, mime, bom) => new Promise((resolve) => {
  if (isDataUrl(data) || isBlobUrl(data)) {
    return resolve(data);
  }

  const file = makeCompatFile(data, filename, mime, bom);

  if (isIOS() && typeof FileReader !== 'undefined') {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result;
      const fileURL = isChromeIOS() ? url : url.replace(/^data:[^;]*;/, 'data:attachment/file;');
      resolve(fileURL);
    };
    return reader.readAsDataURL(file);
  }
  const fileURL = createObjectURL(file);
  return resolve(fileURL);
});
