// import with comlink loader in factory mode
// see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default
import { wrap, releaseProxy } from 'comlink';
import EncryptFileWorker from './encryptFile.worker';

// async method to start a worker, encrypt file, then terminate
export default async (file, publicKey) => {
  // instantiates a worker
  const workerInstance = new EncryptFileWorker();
  const proxy = wrap(workerInstance);
  // calls encryptFile
  const encrypted = await proxy.encryptFile(file, publicKey);
  // terminates worker instance, see ./loader.js
  workerInstance.terminate();
  // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
  proxy[releaseProxy]();
  return encrypted;
};
