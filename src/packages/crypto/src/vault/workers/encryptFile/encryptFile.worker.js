// this file wraps decryptFile helper in a worker factory (see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default)
// and adds terminate function to allow closing worker

import { encryptFileForVault as encryptFileForVaultBuilder } from '@misakey/crypto/vault';
import { expose } from 'comlink';

export default {};

const encryptFileForVault = encryptFileForVaultBuilder;

const api = {
  encryptFileForVault,
};

expose(api);


/*
  HOW TO USE
  import WorkerFactory from 'comlink-loader!./loader';

  const worker = new WorkerFactory();
  const decrypted = await worker.encryptFile(a, b); // returns result of encryptFileHelper
  worker.terminate(); // terminates worker
  worker[Comlink.releaseProxy](); // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
*/
