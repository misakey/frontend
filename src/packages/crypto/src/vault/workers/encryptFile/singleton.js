// import with comlink loader in singleton mode (see https://github.com/GoogleChromeLabs/comlink-loader#singleton-mode)
// wrap function in a singleton Worker instance
// a singleton worker is instanciated on file import and will handle all incoming calls
// eslint-disable-next-line
import {encryptFileForVault} from 'comlink-loader?singleton!./loader';

export default encryptFileForVault;
