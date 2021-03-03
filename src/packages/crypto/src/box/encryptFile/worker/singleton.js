// import with comlink loader in singleton mode (see https://github.com/GoogleChromeLabs/comlink-loader#singleton-mode)
// wrap function in a singleton Worker instance
// a singleton worker is instanciated on file import and will handle all incoming calls
import { wrap } from 'comlink';
import EncryptFileWorker from './encryptFile.worker';

const workerInstance = new EncryptFileWorker();
const proxy = wrap(workerInstance);

export default proxy.encryptFile;
