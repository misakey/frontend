// import with comlink loader in singleton mode (see https://github.com/GoogleChromeLabs/comlink-loader#singleton-mode)
// wrap function in a singleton Worker instance
// a singleton worker is instanciated on file import and will handle all incoming calls
import { wrap } from 'comlink';
import EncryptFileForVaultWorker from './encryptFile.worker';

const workerInstance = new EncryptFileForVaultWorker();
const proxy = wrap(workerInstance);

export default proxy.encryptFileForVault;
