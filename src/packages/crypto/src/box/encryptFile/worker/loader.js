// this file wraps decryptFile helper in a worker factory (see https://github.com/GoogleChromeLabs/comlink-loader#factory-mode-default)
// and adds terminate function to allow closing worker

import encryptFileHelper from '@misakey/crypto/box/encryptFile';

// close is a deprecated global accessible from inside worker scope: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/close
// waiting for
// [this PR](https://github.com/GoogleChromeLabs/comlink-loader/pull/27)
// to be merged to handle more cleanly worker termination
// eslint-disable-next-line no-restricted-globals
export function terminate() { close(); }

export const encryptFile = encryptFileHelper;

/*
  HOW TO USE
  import WorkerFactory from 'comlink-loader!./loader';

  const worker = new WorkerFactory();
  const decrypted = await worker.encryptFile(a, b); // returns result of encryptFileHelper
  worker.terminate(); // terminates worker
  worker[Comlink.releaseProxy](); // releases proxy to be garbage collected (see https://github.com/GoogleChromeLabs/comlink#comlinkreleaseproxy)
*/
