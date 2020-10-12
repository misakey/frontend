// import with comlink loader in factory mode
// see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default
// eslint-disable-next-line
import EncryptFileWorker from 'comlink-loader!./loader';
import * as Comlink from 'comlink';

// async method to start a worker, encrypt file, then terminate
export default async (file, publicKey) => {
  // instantiates a worker
  const worker = new EncryptFileWorker();
  // calls encryptFile
  const encrypted = await worker.encryptFile(file, publicKey);
  // terminates worker instance, see ./loader.js
  worker.terminate();
  // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
  worker[Comlink.releaseProxy]();
  return encrypted;
};
