// import with comlink loader in factory mode
// see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default
import { wrap, releaseProxy } from 'comlink';
import DecryptFileWorker from './decryptFile.worker';

export default async (encryptedFile, decryptedContent) => {
  // instanciates a worker
  const workerInstance = new DecryptFileWorker();
  const proxy = wrap(workerInstance);
  // calls decryptFile
  const decrypted = await proxy.decryptFile(encryptedFile, decryptedContent);
  // terminates worker instance
  workerInstance.terminate();
  // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
  proxy[releaseProxy]();
  return decrypted;
};
