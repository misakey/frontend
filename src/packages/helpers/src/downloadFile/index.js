/* Implementation is freely inspired from
- https://github.com/kennethjiang/js-file-download
Copyright 2017 Kenneth Jiang
- https://github.com/eligrey/FileSaver.js
Copyright © 2016 Eli Grey

Both are under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE */

import isNil from '@misakey/helpers/isNil';
import isDataUrl from '@misakey/helpers/isDataUrl';
import makeCompatFile from '@misakey/helpers/makeCompatFile';
import makeFileURL from '@misakey/helpers/makeFileURL';
import { revokeObjectURL } from '@misakey/helpers/objectURL';

// CONSTANTS
const MS_SAVE_BLOB = !isNil(window.navigator.msSaveBlob);

// HELPERS
function revokeBlob(blobURL) {
  revokeObjectURL(blobURL);
}

export default function (data, filename, shouldRevokeBlob = true, mime, bom) {
  // cases where no download link is required
  if (!isDataUrl(data) && MS_SAVE_BLOB) {
    const blob = makeCompatFile(data, filename, mime, bom);
    window.navigator.msSaveBlob(blob, filename);
    return Promise.resolve();
  }

  return makeFileURL(data, filename, mime, bom)
    .then((fileURL) => {
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = fileURL;
      tempLink.setAttribute('download', filename);

      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
      }

      document.body.appendChild(tempLink);

      tempLink.click();

      if (shouldRevokeBlob) {
        // Fixes "webkit blob resource error 1"
        setTimeout(() => {
          revokeBlob(fileURL);
          if (document.body.contains(tempLink)) {
            document.body.removeChild(tempLink);
          }
        }, 0);
      }
    });
}
