// import with comlink loader in factory mode
// see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default
// eslint-disable-next-line
import DecryptFileWorker from 'comlink-loader!./loader';
import * as Comlink from 'comlink';

export default async (encryptedFile, decryptedContent) => {
  // instanciates a worker
  const worker = new DecryptFileWorker();
  // calls decryptFile
  const decrypted = await worker.decryptFile(encryptedFile, decryptedContent);
  // terminates worker instance, see ./loader.js
  worker.terminate();
  // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
  worker[Comlink.releaseProxy]();
  return decrypted;
};
