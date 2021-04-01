/**
 * In JavaScript, a "Blob" is a more general notion than a file,
 * meaning that a JS "File" is also a "Blob".
 * https://developer.mozilla.org/en-US/docs/Web/API/Blob
 */
export default async function uint8ArrayFromBlob(blob) {
  const fileReader = new FileReader();
  const promise = new Promise((resolve) => {
    fileReader.readAsArrayBuffer(blob);
    fileReader.addEventListener('loadend', () => {
      const result = new Uint8Array(fileReader.result);
      resolve(result);
    });
  });
  return promise;
}
