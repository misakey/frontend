// this file wraps decryptFile helper in a worker factory (see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default)
// and adds terminate function to allow closing worker

import decryptFileHelper from '@misakey/core/crypto/box/decryptFile';
import { expose } from 'comlink';

export default {};

const decryptFile = decryptFileHelper;

const api = {
  decryptFile,
};

expose(api);
/*
  HOW TO USE
  import WorkerFactory from 'comlink-loader!./loader';

  const worker = new WorkerFactory();
  const decrypted = await worker.decryptFile(a, b); // returns result of decryptFileHelper
  worker.terminate(); // terminates worker
  worker[Comlink.releaseProxy](); // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
*/
